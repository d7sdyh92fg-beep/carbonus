-- Fix customers table RLS policies to allow public inserts

-- Drop existing policies
DROP POLICY IF EXISTS "Admin full access to customers" ON public.customers;
DROP POLICY IF EXISTS "Public can create customers" ON public.customers;

-- Create separate policies for each operation
-- Admin policies (restrictive)
CREATE POLICY "Admins can select all customers" ON public.customers
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update customers" ON public.customers
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete customers" ON public.customers
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can insert customers (permissive policy for everyone)
CREATE POLICY "Anyone can create customers" ON public.customers
FOR INSERT
WITH CHECK (true);