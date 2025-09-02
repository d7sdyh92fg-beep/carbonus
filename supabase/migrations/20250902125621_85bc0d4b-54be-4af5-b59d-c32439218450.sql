-- Create a simple direct admin check that bypasses any RLS issues
CREATE OR REPLACE FUNCTION public.check_user_is_admin(user_email text)
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
    WHERE u.email = user_email
      AND ur.role = 'admin'
  );
$$;