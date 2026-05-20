INSERT INTO public.car_blocked_dates (car_id, blocked_date, reservation_type, reason)
SELECT '8', d::date, 'block', 'Nuoma nuo 2026-06-01'
FROM generate_series('2026-05-20'::date, '2026-05-31'::date, '1 day'::interval) d
ON CONFLICT DO NOTHING;