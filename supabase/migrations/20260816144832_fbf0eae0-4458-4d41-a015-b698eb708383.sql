CREATE OR REPLACE FUNCTION public.get_my_admin_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN public.has_role(auth.uid(), 'owner'::public.app_role) THEN 'owner'
    WHEN public.has_role(auth.uid(), 'fleet_manager'::public.app_role) THEN 'fleet_manager'
    WHEN public.has_role(auth.uid(), 'admin'::public.app_role) THEN 'admin'
    ELSE 'user'
  END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_my_admin_role() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_my_admin_role() TO authenticated;