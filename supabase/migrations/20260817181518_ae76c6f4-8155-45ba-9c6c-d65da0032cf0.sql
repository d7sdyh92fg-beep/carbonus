CREATE OR REPLACE FUNCTION public.can_manage_reservations()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin'::public.app_role, 'owner'::public.app_role)
  );
$$;

DROP POLICY IF EXISTS "Admins can update all reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can delete all reservations" ON public.reservations;

CREATE POLICY "Admins can update all reservations"
ON public.reservations FOR UPDATE TO authenticated
USING (public.can_manage_reservations())
WITH CHECK (public.can_manage_reservations());

CREATE POLICY "Admins can delete all reservations"
ON public.reservations FOR DELETE TO authenticated
USING (public.can_manage_reservations());