-- Fix critical security vulnerabilities in customers and reservations tables
-- Drop overly permissive policies that expose sensitive data

-- Drop existing public policies for customers table
DROP POLICY IF EXISTS "Anyone can view customers" ON public.customers;

-- Drop existing public policies for reservations table  
DROP POLICY IF EXISTS "Anyone can view reservations" ON public.reservations;
DROP POLICY IF EXISTS "Anyone can update reservations" ON public.reservations;

-- Create secure policies for customers table
-- Only allow users to view their own customer records
CREATE POLICY "Users can view own customer data" 
ON public.customers 
FOR SELECT 
TO authenticated
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Allow users to update their own customer records
CREATE POLICY "Users can update own customer data"
ON public.customers
FOR UPDATE
TO authenticated
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Create secure policies for reservations table
-- Only allow users to view their own reservations by matching customer_id to customers table
CREATE POLICY "Users can view own reservations"
ON public.reservations
FOR SELECT
TO authenticated
USING (
  customer_id IN (
    SELECT id FROM public.customers 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Only allow users to update their own reservations
CREATE POLICY "Users can update own reservations"
ON public.reservations
FOR UPDATE
TO authenticated
USING (
  customer_id IN (
    SELECT id FROM public.customers 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Update the insert policies to ensure authenticated users only create records for themselves
DROP POLICY IF EXISTS "Anyone can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Anyone can insert reservations" ON public.reservations;

CREATE POLICY "Authenticated users can create customer records"
ON public.customers
FOR INSERT
TO authenticated
WITH CHECK (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Authenticated users can create reservations"
ON public.reservations
FOR INSERT
TO authenticated
WITH CHECK (
  customer_id IN (
    SELECT id FROM public.customers 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);