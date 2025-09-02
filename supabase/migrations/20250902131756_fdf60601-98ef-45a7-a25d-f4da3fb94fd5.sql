-- Fix RLS policies to work with admin authentication
-- Remove problematic policies that reference auth.users directly

-- Drop existing policies that cause permission errors
DROP POLICY IF EXISTS "Users can view own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can update own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Authenticated users can create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can view own customer data" ON public.customers;
DROP POLICY IF EXISTS "Users can update own customer data" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can create customer records" ON public.customers;

-- Create simplified policies for admin access and public booking
-- For reservations - admin can do everything, public can create
CREATE POLICY "Admins can manage all reservations" ON public.reservations
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can create reservations" ON public.reservations
FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can view reservations for booking" ON public.reservations
FOR SELECT TO anon, authenticated
USING (true);

-- For customers - admin can do everything, anyone can create customer records
CREATE POLICY "Admins can manage all customers" ON public.customers
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can create customer records" ON public.customers
FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can view customers for booking" ON public.customers
FOR SELECT TO anon, authenticated
USING (true);