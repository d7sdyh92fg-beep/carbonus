-- Fix the admin check function 
-- The issue might be with accessing auth.users from within the function
DROP FUNCTION IF EXISTS public.is_current_user_admin();

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role);
$$;