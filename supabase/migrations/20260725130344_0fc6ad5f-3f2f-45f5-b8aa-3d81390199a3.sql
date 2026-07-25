
-- =====================================================================
-- 1) pricing_extras — server-side allowlist of extras & their prices
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.pricing_extras (
  code text PRIMARY KEY,
  category text NOT NULL CHECK (category IN ('insurance','service','package')),
  name text NOT NULL,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  unit text NOT NULL CHECK (unit IN ('per_day','one_time')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.pricing_extras TO anon, authenticated;
GRANT ALL ON public.pricing_extras TO service_role;

ALTER TABLE public.pricing_extras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pricing_extras public read" ON public.pricing_extras;
CREATE POLICY "pricing_extras public read"
  ON public.pricing_extras FOR SELECT
  USING (active = true);

DROP POLICY IF EXISTS "pricing_extras admin manage" ON public.pricing_extras;
CREATE POLICY "pricing_extras admin manage"
  ON public.pricing_extras FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS update_pricing_extras_updated_at ON public.pricing_extras;
CREATE TRIGGER update_pricing_extras_updated_at
  BEFORE UPDATE ON public.pricing_extras
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed current extras (mirrors ReservationInsurance/ReservationServices)
INSERT INTO public.pricing_extras (code, category, name, price, unit) VALUES
  ('max-liability',          'insurance', 'Basic liability',            0,     'per_day'),
  ('ldw-with-liability',     'insurance', 'LDW with liability',         10,    'per_day'),
  ('ldw-no-liability',       'insurance', 'Full coverage',              20,    'per_day'),
  ('additional-driver',      'service',   'Additional driver',          4.01,  'per_day'),
  ('abroad-zone3',           'service',   'Abroad zone 3',              500,   'one_time'),
  ('abroad-zone2',           'service',   'Abroad zone 2',              300,   'one_time'),
  ('abroad-zone1',           'service',   'Abroad zone 1',              150,   'one_time'),
  ('roadside-assistance',    'service',   'Roadside assistance',        15,    'one_time'),
  ('tire-glass-protection',  'service',   'Tire & glass protection',    5.5,   'per_day'),
  ('baby-seat',              'service',   'Baby seat',                  3,     'per_day'),
  ('child-seat',              'service',   'Child seat',                 3,     'per_day'),
  ('package-romantic',       'package',   'Romantic package',           70,    'one_time'),
  ('package-wedding',        'package',   'Wedding package',            150,   'one_time')
ON CONFLICT (code) DO NOTHING;

-- =====================================================================
-- 2) Drop old (untrusted) create_reservation overloads
-- =====================================================================
DROP FUNCTION IF EXISTS public.create_reservation(
  uuid, text, text, date, date, date, time, date, time,
  integer, numeric, numeric, numeric, numeric,
  text, text, text, text
);
DROP FUNCTION IF EXISTS public.create_reservation(
  uuid, text, text, date, date, date, time, date, time,
  integer, numeric, numeric, numeric, numeric,
  text, text, text, text, text
);

-- =====================================================================
-- 3) Hardened create_reservation: server computes ALL prices,
--    advisory-lock prevents concurrent double-booking.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.create_reservation(
  p_customer_id      uuid,
  p_car_id           text,
  p_start_date       date,
  p_end_date         date,
  p_pickup_time      time,
  p_return_time      time,
  p_insurance_code   text DEFAULT NULL,
  p_service_codes    text[] DEFAULT ARRAY[]::text[],
  p_package_code     text DEFAULT NULL,
  p_delivery_fee     numeric DEFAULT 0,
  p_payment_method   text DEFAULT 'online',
  p_payment_provider text DEFAULT 'stripe',
  p_status           text DEFAULT 'awaiting_payment',
  p_language         text DEFAULT 'lt',
  p_pricing_notes    text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_car               public.cars%ROWTYPE;
  v_pickup_ts         timestamp;
  v_return_ts         timestamp;
  v_hours             numeric;
  v_days              integer;
  v_daily_rate        numeric;
  v_rental_cost       numeric;
  v_insurance_total   numeric := 0;
  v_services_total    numeric := 0;
  v_package_total     numeric := 0;
  v_total             numeric;
  v_deposit           numeric;
  v_reservation_id    uuid;
  v_conflict          integer;
  v_blocked           integer;
  v_lock_key          bigint;
  v_extra             public.pricing_extras%ROWTYPE;
  v_found_services    integer;
  v_requested         integer;
BEGIN
  -- ---- basic validation ------------------------------------------------
  IF p_customer_id IS NULL THEN
    RAISE EXCEPTION 'CUSTOMER_REQUIRED' USING errcode = '22023';
  END IF;
  IF p_car_id IS NULL OR length(p_car_id) = 0 THEN
    RAISE EXCEPTION 'CAR_REQUIRED' USING errcode = '22023';
  END IF;
  IF p_start_date IS NULL OR p_end_date IS NULL OR p_end_date < p_start_date THEN
    RAISE EXCEPTION 'Invalid reservation dates' USING errcode = '22023';
  END IF;
  IF p_start_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'START_IN_PAST' USING errcode = '22023';
  END IF;
  IF p_pickup_time IS NULL OR p_return_time IS NULL THEN
    RAISE EXCEPTION 'TIME_REQUIRED' USING errcode = '22023';
  END IF;
  IF p_delivery_fee IS NULL OR p_delivery_fee < 0 OR p_delivery_fee > 200 THEN
    RAISE EXCEPTION 'INVALID_DELIVERY_FEE' USING errcode = '22023';
  END IF;

  -- ---- serialize concurrent bookings for the same car ------------------
  v_lock_key := hashtextextended('reservation:car:' || p_car_id, 0);
  PERFORM pg_advisory_xact_lock(v_lock_key);

  -- ---- load car row (source of truth for pricing) ----------------------
  SELECT * INTO v_car FROM public.cars WHERE id = p_car_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'CAR_NOT_FOUND' USING errcode = 'P0002';
  END IF;
  IF v_car.is_available IS FALSE THEN
    RAISE EXCEPTION 'CAR_UNAVAILABLE' USING errcode = 'P0001';
  END IF;

  -- ---- overlap re-check under lock -------------------------------------
  SELECT count(*) INTO v_conflict
  FROM public.reservations
  WHERE car_id = p_car_id
    AND deleted_at IS NULL
    AND status IN ('paid','pending','requested','picked_up','awaiting_payment')
    AND daterange(start_date, end_date, '[]') && daterange(p_start_date, p_end_date, '[]');
  IF v_conflict > 0 THEN
    RAISE EXCEPTION 'DATE_CONFLICT: Selected dates overlap an existing reservation'
      USING errcode = 'P0001';
  END IF;

  SELECT count(*) INTO v_blocked
  FROM public.car_blocked_dates
  WHERE car_id = p_car_id
    AND blocked_date BETWEEN p_start_date AND p_end_date;
  IF v_blocked > 0 THEN
    RAISE EXCEPTION 'DATE_BLOCKED: Selected dates are blocked by admin'
      USING errcode = 'P0001';
  END IF;

  -- ---- server-side rental-days (24h ceil, min 1) -----------------------
  v_pickup_ts := (p_start_date::text || ' ' || p_pickup_time::text)::timestamp;
  v_return_ts := (p_end_date::text || ' ' || p_return_time::text)::timestamp;
  v_hours := GREATEST(EXTRACT(EPOCH FROM (v_return_ts - v_pickup_ts)) / 3600.0, 0);
  v_days := GREATEST(1, CEIL(v_hours / 24.0)::integer);

  -- ---- tiered daily rate from cars table (never trust client) ---------
  IF v_days >= 7 AND v_car.price_tier3 IS NOT NULL THEN
    v_daily_rate := v_car.price_tier3;
  ELSIF v_days >= 3 AND v_car.price_tier2 IS NOT NULL THEN
    v_daily_rate := v_car.price_tier2;
  ELSIF v_car.price_tier1 IS NOT NULL THEN
    v_daily_rate := v_car.price_tier1;
  ELSE
    v_daily_rate := v_car.price_per_day;
  END IF;

  v_rental_cost := v_daily_rate * v_days;

  -- ---- insurance (allowlist) ------------------------------------------
  IF p_insurance_code IS NOT NULL AND length(p_insurance_code) > 0 THEN
    SELECT * INTO v_extra FROM public.pricing_extras
     WHERE code = p_insurance_code AND category = 'insurance' AND active = true;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'INVALID_INSURANCE:%', p_insurance_code USING errcode = '22023';
    END IF;
    v_insurance_total := CASE WHEN v_extra.unit = 'per_day'
                              THEN v_extra.price * v_days
                              ELSE v_extra.price END;
  END IF;

  -- ---- services (allowlist, all-or-nothing) ---------------------------
  IF p_service_codes IS NOT NULL AND array_length(p_service_codes, 1) > 0 THEN
    v_requested := array_length(p_service_codes, 1);

    SELECT count(*) INTO v_found_services
      FROM public.pricing_extras
     WHERE code = ANY(p_service_codes)
       AND category = 'service'
       AND active = true;
    IF v_found_services <> v_requested THEN
      RAISE EXCEPTION 'INVALID_SERVICE_CODE' USING errcode = '22023';
    END IF;

    SELECT COALESCE(SUM(
      CASE WHEN unit = 'per_day' THEN price * v_days ELSE price END
    ), 0) INTO v_services_total
      FROM public.pricing_extras
     WHERE code = ANY(p_service_codes)
       AND category = 'service'
       AND active = true;
  END IF;

  -- ---- package (allowlist) --------------------------------------------
  IF p_package_code IS NOT NULL AND length(p_package_code) > 0 THEN
    SELECT * INTO v_extra FROM public.pricing_extras
     WHERE code = p_package_code AND category = 'package' AND active = true;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'INVALID_PACKAGE:%', p_package_code USING errcode = '22023';
    END IF;
    v_package_total := v_extra.price;
  END IF;

  v_deposit := COALESCE(v_car.deposit_amount, 200);
  v_total   := v_rental_cost + v_insurance_total + v_services_total
               + v_package_total + COALESCE(p_delivery_fee, 0);

  -- ---- INSERT reservation with server-computed snapshot ---------------
  INSERT INTO public.reservations (
    customer_id, car_name, car_id,
    start_date, end_date, pickup_date, pickup_time, return_date, return_time,
    rental_days, daily_rate, total_rental_cost, deposit_amount, total_amount,
    status, payment_method, payment_provider, pricing_notes, language
  ) VALUES (
    p_customer_id, v_car.name, p_car_id,
    p_start_date, p_end_date, p_start_date, p_pickup_time, p_end_date, p_return_time,
    v_days, v_daily_rate, v_rental_cost, v_deposit, v_total,
    COALESCE(p_status, 'awaiting_payment'),
    COALESCE(p_payment_method, 'online'),
    COALESCE(p_payment_provider, 'stripe'),
    p_pricing_notes,
    COALESCE(p_language, 'lt')
  ) RETURNING id INTO v_reservation_id;

  RETURN jsonb_build_object(
    'id',              v_reservation_id,
    'rental_days',     v_days,
    'daily_rate',      v_daily_rate,
    'rental_cost',     v_rental_cost,
    'insurance_total', v_insurance_total,
    'services_total',  v_services_total,
    'package_total',   v_package_total,
    'delivery_fee',    COALESCE(p_delivery_fee, 0),
    'deposit_amount',  v_deposit,
    'total_amount',    v_total
  );
END
$$;

GRANT EXECUTE ON FUNCTION public.create_reservation(
  uuid, text, date, date, time, time,
  text, text[], text, numeric, text, text, text, text, text
) TO anon, authenticated, service_role;

-- =====================================================================
-- 4) Server-side availability check (used by "Rinktis" click)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.check_car_availability(
  p_car_id     text,
  p_start_date date,
  p_end_date   date
) RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conflict int;
  v_blocked  int;
BEGIN
  IF p_car_id IS NULL OR p_start_date IS NULL OR p_end_date IS NULL
     OR p_end_date < p_start_date THEN
    RETURN jsonb_build_object('available', false, 'reason', 'INVALID_INPUT');
  END IF;

  SELECT count(*) INTO v_conflict
  FROM public.reservations
  WHERE car_id = p_car_id
    AND deleted_at IS NULL
    AND status IN ('paid','pending','requested','picked_up','awaiting_payment')
    AND daterange(start_date, end_date, '[]') && daterange(p_start_date, p_end_date, '[]');
  IF v_conflict > 0 THEN
    RETURN jsonb_build_object('available', false, 'reason', 'DATE_CONFLICT');
  END IF;

  SELECT count(*) INTO v_blocked
  FROM public.car_blocked_dates
  WHERE car_id = p_car_id AND blocked_date BETWEEN p_start_date AND p_end_date;
  IF v_blocked > 0 THEN
    RETURN jsonb_build_object('available', false, 'reason', 'DATE_BLOCKED');
  END IF;

  RETURN jsonb_build_object('available', true);
END
$$;

GRANT EXECUTE ON FUNCTION public.check_car_availability(text, date, date)
  TO anon, authenticated, service_role;
