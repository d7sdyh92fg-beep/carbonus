-- Restore safe access to car blocked dates for admin calendars and public availability

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Reset existing grants so contact details are not exposed publicly
REVOKE ALL ON public.car_blocked_dates FROM anon, authenticated;

-- Public visitors only need availability dates for the booking calendar
GRANT SELECT (car_id, blocked_date, reservation_type) ON public.car_blocked_dates TO anon;

-- Admin users need full access, still protected by RLS has_role policies
GRANT SELECT, INSERT, UPDATE, DELETE ON public.car_blocked_dates TO authenticated;

-- Replace broad public SELECT policy with role-specific policies
DROP POLICY IF EXISTS "Anyone can view blocked dates" ON public.car_blocked_dates;
DROP POLICY IF EXISTS "Admins can view blocked dates" ON public.car_blocked_dates;
DROP POLICY IF EXISTS "Public can view blocked date availability" ON public.car_blocked_dates;

CREATE POLICY "Public can view blocked date availability"
ON public.car_blocked_dates
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Admins can view blocked dates"
ON public.car_blocked_dates
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));