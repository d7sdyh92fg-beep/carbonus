DROP VIEW IF EXISTS public.reservation_availability;

CREATE VIEW public.reservation_availability
WITH (security_invoker = true)
AS
SELECT car_id, start_date, end_date
FROM reservations
WHERE status = ANY (ARRAY['requested'::text, 'pending'::text, 'confirmed'::text]);