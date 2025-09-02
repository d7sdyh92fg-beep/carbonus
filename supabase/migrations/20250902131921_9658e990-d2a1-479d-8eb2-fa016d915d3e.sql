-- First, drop ALL existing policies on reservations and customers tables
DROP POLICY IF EXISTS "Admins can manage all reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can view all reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can view own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can update own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Authenticated users can create reservations" ON public.reservations;

DROP POLICY IF EXISTS "Admins can manage all customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can view all customers" ON public.customers;
DROP POLICY IF EXISTS "Users can view own customer data" ON public.customers;
DROP POLICY IF EXISTS "Users can update own customer data" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can create customer records" ON public.customers;

-- Now create simplified policies that work without referencing auth.users
-- For reservations
CREATE POLICY "Admin full access to reservations" ON public.reservations
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can create reservations" ON public.reservations
FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Public can view reservations" ON public.reservations
FOR SELECT TO anon, authenticated
USING (true);

-- For customers  
CREATE POLICY "Admin full access to customers" ON public.customers
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can create customers" ON public.customers
FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Public can view customers" ON public.customers
FOR SELECT TO anon, authenticated
USING (true);