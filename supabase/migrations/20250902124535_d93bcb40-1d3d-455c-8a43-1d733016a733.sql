-- Create a function to check if the current user is an admin
-- This bypasses RLS issues by using SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN auth.users u ON ur.user_id = u.id
    WHERE u.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND ur.role = 'admin'
  );
$$;