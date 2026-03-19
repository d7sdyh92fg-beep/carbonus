CREATE POLICY "Anyone can view blocked dates"
ON public.car_blocked_dates
FOR SELECT
TO public
USING (true);