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
    AND status IN ('paid','pending','requested','picked_up','awaiting_payment','needs_resolution')
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

CREATE OR REPLACE FUNCTION public.get_booked_ranges(p_start date, p_end date, p_car_id text DEFAULT NULL::text)
 RETURNS TABLE(car_id text, start_date date, end_date date)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT r.car_id, r.start_date, r.end_date
  FROM public.reservations r
  WHERE r.deleted_at IS NULL
    AND r.status IN ('paid','pending','requested','picked_up','awaiting_payment','needs_resolution')
    AND (p_car_id IS NULL OR r.car_id = p_car_id)
    AND r.start_date <= COALESCE(p_end, r.start_date)
    AND r.end_date   >= COALESCE(p_start, r.end_date);
$function$;