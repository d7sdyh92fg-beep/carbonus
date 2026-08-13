CREATE OR REPLACE FUNCTION public.get_booked_ranges(
  p_start date,
  p_end date,
  p_car_id text DEFAULT NULL
)
RETURNS TABLE(car_id text, start_date date, end_date date)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT r.car_id, r.start_date, r.end_date
  FROM public.reservations r
  WHERE r.deleted_at IS NULL
    AND r.status IN ('paid','pending','requested','picked_up','awaiting_payment')
    AND (p_car_id IS NULL OR r.car_id = p_car_id)
    AND r.start_date <= COALESCE(p_end, r.start_date)
    AND r.end_date   >= COALESCE(p_start, r.end_date);
$$;

REVOKE ALL ON FUNCTION public.get_booked_ranges(date, date, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_booked_ranges(date, date, text) TO anon, authenticated, service_role;