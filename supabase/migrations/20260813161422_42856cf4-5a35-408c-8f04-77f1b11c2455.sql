
CREATE TABLE IF NOT EXISTS public.promo_codes (
  code text PRIMARY KEY,
  discount_percent numeric NOT NULL DEFAULT 10,
  min_rental_days integer NOT NULL DEFAULT 1,
  valid_until date,
  active boolean NOT NULL DEFAULT true,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.promo_codes TO authenticated;
GRANT ALL ON public.promo_codes TO service_role;

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage promo codes" ON public.promo_codes;
CREATE POLICY "Admins can manage promo codes" ON public.promo_codes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.promo_codes (code, discount_percent, min_rental_days, valid_until, description)
VALUES ('ACIU10', 10, 3, (CURRENT_DATE + INTERVAL '6 months')::date, 'Atsiliepimo nuolaida - 10% nuomos kainai')
ON CONFLICT (code) DO NOTHING;

ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS promo_code text,
  ADD COLUMN IF NOT EXISTS discount_amount numeric NOT NULL DEFAULT 0;

-- Public validation RPC (no direct table read needed)
CREATE OR REPLACE FUNCTION public.validate_promo_code(p_code text, p_rental_days integer DEFAULT 1)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v public.promo_codes%ROWTYPE;
BEGIN
  IF p_code IS NULL OR length(trim(p_code)) = 0 THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'EMPTY');
  END IF;

  SELECT * INTO v FROM public.promo_codes
   WHERE code = upper(trim(p_code)) AND active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'NOT_FOUND');
  END IF;

  IF v.valid_until IS NOT NULL AND v.valid_until < CURRENT_DATE THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'EXPIRED');
  END IF;

  IF COALESCE(p_rental_days, 1) < v.min_rental_days THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'MIN_DAYS', 'min_rental_days', v.min_rental_days);
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'code', v.code,
    'discount_percent', v.discount_percent,
    'min_rental_days', v.min_rental_days,
    'valid_until', v.valid_until
  );
END;
$$;

REVOKE ALL ON FUNCTION public.validate_promo_code(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_promo_code(text, integer) TO anon, authenticated, service_role;

-- create_reservation with promo code support
CREATE OR REPLACE FUNCTION public.create_reservation(
  p_customer_id uuid, p_car_id text, p_start_date date, p_end_date date,
  p_pickup_time time without time zone, p_return_time time without time zone,
  p_insurance_code text DEFAULT NULL::text,
  p_service_codes text[] DEFAULT ARRAY[]::text[],
  p_package_code text DEFAULT NULL::text,
  p_delivery_fee numeric DEFAULT 0,
  p_payment_method text DEFAULT 'online'::text,
  p_payment_provider text DEFAULT 'stripe'::text,
  p_status text DEFAULT 'awaiting_payment'::text,
  p_language text DEFAULT 'lt'::text,
  p_pricing_notes text DEFAULT NULL::text,
  p_promo_code text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  v_promo             public.promo_codes%ROWTYPE;
  v_promo_code        text := NULL;
  v_discount          numeric := 0;
BEGIN
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

  v_lock_key := hashtextextended('reservation:car:' || p_car_id, 0);
  PERFORM pg_advisory_xact_lock(v_lock_key);

  SELECT * INTO v_car FROM public.cars WHERE id = p_car_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'CAR_NOT_FOUND' USING errcode = 'P0002';
  END IF;
  IF v_car.is_available IS FALSE THEN
    RAISE EXCEPTION 'CAR_UNAVAILABLE' USING errcode = 'P0001';
  END IF;

  SELECT count(*) INTO v_conflict
  FROM public.reservations
  WHERE car_id = p_car_id
    AND deleted_at IS NULL
    AND status IN ('paid','pending','requested','picked_up','awaiting_payment')
    AND daterange(start_date, end_date, '[]') && daterange(p_start_date, p_end_date, '[]');
  IF v_conflict > 0 THEN
    RAISE EXCEPTION 'DATE_CONFLICT: Selected dates overlap an existing reservation' USING errcode = 'P0001';
  END IF;

  SELECT count(*) INTO v_blocked
  FROM public.car_blocked_dates
  WHERE car_id = p_car_id
    AND blocked_date BETWEEN p_start_date AND p_end_date;
  IF v_blocked > 0 THEN
    RAISE EXCEPTION 'DATE_BLOCKED: Selected dates are blocked by admin' USING errcode = 'P0001';
  END IF;

  v_pickup_ts := (p_start_date::text || ' ' || p_pickup_time::text)::timestamp;
  v_return_ts := (p_end_date::text || ' ' || p_return_time::text)::timestamp;
  v_hours := GREATEST(EXTRACT(EPOCH FROM (v_return_ts - v_pickup_ts)) / 3600.0, 0);
  v_days := GREATEST(1, CEIL(v_hours / 24.0)::integer);

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

  IF p_insurance_code IS NOT NULL AND length(p_insurance_code) > 0 THEN
    SELECT * INTO v_extra FROM public.pricing_extras
     WHERE code = p_insurance_code AND category = 'insurance' AND active = true;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'INVALID_INSURANCE:%', p_insurance_code USING errcode = '22023';
    END IF;
    v_insurance_total := CASE WHEN v_extra.unit = 'per_day' THEN v_extra.price * v_days ELSE v_extra.price END;
  END IF;

  IF p_service_codes IS NOT NULL AND array_length(p_service_codes, 1) > 0 THEN
    v_requested := array_length(p_service_codes, 1);
    SELECT count(*) INTO v_found_services
      FROM public.pricing_extras
     WHERE code = ANY(p_service_codes) AND category = 'service' AND active = true;
    IF v_found_services <> v_requested THEN
      RAISE EXCEPTION 'INVALID_SERVICE_CODE' USING errcode = '22023';
    END IF;
    SELECT COALESCE(SUM(CASE WHEN unit = 'per_day' THEN price * v_days ELSE price END), 0)
      INTO v_services_total
      FROM public.pricing_extras
     WHERE code = ANY(p_service_codes) AND category = 'service' AND active = true;
  END IF;

  IF p_package_code IS NOT NULL AND length(p_package_code) > 0 THEN
    SELECT * INTO v_extra FROM public.pricing_extras
     WHERE code = p_package_code AND category = 'package' AND active = true;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'INVALID_PACKAGE:%', p_package_code USING errcode = '22023';
    END IF;
    v_package_total := v_extra.price;
  END IF;

  -- ---- promo code (discount applies to rental cost only) ---------------
  IF p_promo_code IS NOT NULL AND length(trim(p_promo_code)) > 0 THEN
    SELECT * INTO v_promo FROM public.promo_codes
     WHERE code = upper(trim(p_promo_code)) AND active = true;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'INVALID_PROMO_CODE' USING errcode = '22023';
    END IF;
    IF v_promo.valid_until IS NOT NULL AND v_promo.valid_until < CURRENT_DATE THEN
      RAISE EXCEPTION 'PROMO_EXPIRED' USING errcode = '22023';
    END IF;
    IF v_days < v_promo.min_rental_days THEN
      RAISE EXCEPTION 'PROMO_MIN_DAYS:%', v_promo.min_rental_days USING errcode = '22023';
    END IF;
    v_promo_code := v_promo.code;
    v_discount := ROUND(v_rental_cost * v_promo.discount_percent / 100.0, 2);
  END IF;

  v_deposit := COALESCE(v_car.deposit_amount, 200);
  v_total   := GREATEST(0, v_rental_cost - v_discount) + v_insurance_total + v_services_total
               + v_package_total + COALESCE(p_delivery_fee, 0);

  INSERT INTO public.reservations (
    customer_id, car_name, car_id,
    start_date, end_date, pickup_date, pickup_time, return_date, return_time,
    rental_days, daily_rate, total_rental_cost, deposit_amount, total_amount,
    status, payment_method, payment_provider, pricing_notes, language,
    promo_code, discount_amount
  ) VALUES (
    p_customer_id, v_car.name, p_car_id,
    p_start_date, p_end_date, p_start_date, p_pickup_time, p_end_date, p_return_time,
    v_days, v_daily_rate, v_rental_cost, v_deposit, v_total,
    COALESCE(p_status, 'awaiting_payment'),
    COALESCE(p_payment_method, 'online'),
    COALESCE(p_payment_provider, 'stripe'),
    p_pricing_notes,
    COALESCE(p_language, 'lt'),
    v_promo_code, v_discount
  ) RETURNING id INTO v_reservation_id;

  -- mark matching promo claim as redeemed (best effort)
  IF v_promo_code IS NOT NULL THEN
    UPDATE public.promo_code_claims
       SET redeemed = true, redeemed_at = now(), redeemed_reservation_id = v_reservation_id, updated_at = now()
     WHERE id = (
       SELECT c.id FROM public.promo_code_claims c
        WHERE c.code = v_promo_code AND c.redeemed = false
          AND c.email IS NOT NULL
          AND lower(c.email) = (SELECT lower(cu.email) FROM public.customers cu WHERE cu.id = p_customer_id)
        ORDER BY c.created_at ASC LIMIT 1
     );
  END IF;

  RETURN jsonb_build_object(
    'id',              v_reservation_id,
    'rental_days',     v_days,
    'daily_rate',      v_daily_rate,
    'rental_cost',     v_rental_cost,
    'insurance_total', v_insurance_total,
    'services_total',  v_services_total,
    'package_total',   v_package_total,
    'delivery_fee',    COALESCE(p_delivery_fee, 0),
    'discount_amount', v_discount,
    'promo_code',      v_promo_code,
    'deposit_amount',  v_deposit,
    'total_amount',    v_total
  );
END
$function$;

REVOKE ALL ON FUNCTION public.create_reservation(uuid, text, date, date, time without time zone, time without time zone, text, text[], text, numeric, text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_reservation(uuid, text, date, date, time without time zone, time without time zone, text, text[], text, numeric, text, text, text, text, text, text) TO anon, authenticated, service_role;
