-- Ensure RLS is enabled
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Admin full access to reservations" ON public.reservations;
DROP POLICY IF EXISTS "Public can create reservations" ON public.reservations;

-- Allow public (including anonymous) to create reservations
CREATE POLICY "Public can create reservations"
ON public.reservations
FOR INSERT
TO public
WITH CHECK (true);

-- Allow admins to view all reservations
CREATE POLICY "Admins can select all reservations"
ON public.reservations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update all reservations
CREATE POLICY "Admins can update all reservations"
ON public.reservations
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete all reservations
CREATE POLICY "Admins can delete all reservations"
ON public.reservations
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));