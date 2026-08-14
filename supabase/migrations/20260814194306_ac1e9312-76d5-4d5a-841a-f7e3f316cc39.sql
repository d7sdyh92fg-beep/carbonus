ALTER TABLE public.car_blocked_dates
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid;

CREATE INDEX IF NOT EXISTS car_blocked_dates_active_idx
  ON public.car_blocked_dates (car_id, blocked_date)
  WHERE deleted_at IS NULL;

DROP POLICY IF EXISTS "Public can view blocked date availability" ON public.car_blocked_dates;
CREATE POLICY "Public can view blocked date availability"
  ON public.car_blocked_dates FOR SELECT TO anon
  USING (deleted_at IS NULL);

CREATE OR REPLACE FUNCTION public.check_car_availability(p_car_id text, p_start_date date, p_end_date date)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  WHERE car_id = p_car_id AND deleted_at IS NULL
    AND blocked_date BETWEEN p_start_date AND p_end_date;
  IF v_blocked > 0 THEN
    RETURN jsonb_build_object('available', false, 'reason', 'DATE_BLOCKED');
  END IF;

  RETURN jsonb_build_object('available', true);
END
$function$;
