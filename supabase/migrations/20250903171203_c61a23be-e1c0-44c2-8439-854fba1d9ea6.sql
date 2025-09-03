-- First, ensure the admin user exists with proper role
-- Insert admin role for the main admin email
INSERT INTO user_roles (user_id, role) 
SELECT 
    auth.users.id, 
    'admin'::app_role
FROM auth.users 
WHERE auth.users.email = 'info@carbonus.lt'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin'::app_role;

-- Also ensure any user with the specific email gets admin access
-- This handles cases where the user might sign up later
CREATE OR REPLACE FUNCTION assign_admin_role()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email = 'info@carbonus.lt' THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'admin'::app_role)
        ON CONFLICT (user_id) DO UPDATE SET role = 'admin'::app_role;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically assign admin role
DROP TRIGGER IF EXISTS assign_admin_role_trigger ON auth.users;
CREATE TRIGGER assign_admin_role_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION assign_admin_role();

-- Ensure the has_role function exists and works properly
CREATE OR REPLACE FUNCTION has_role(_user_id uuid, _role app_role)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_roles 
        WHERE user_id = _user_id 
        AND role = _role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;