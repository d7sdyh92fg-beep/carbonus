-- Add unique constraint for user_id if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_roles_user_id_key'
    ) THEN
        ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- Insert admin role for the main admin email (if user exists)
DO $$
DECLARE 
    admin_user_id uuid;
BEGIN
    -- Find the admin user
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'info@carbonus.lt';
    
    -- If user exists, ensure they have admin role
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role) 
        VALUES (admin_user_id, 'admin'::app_role)
        ON CONFLICT (user_id) DO UPDATE SET role = 'admin'::app_role;
    END IF;
END $$;

-- Update the handle_new_user function to assign admin role to specific email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data ->> 'first_name',
        NEW.raw_user_meta_data ->> 'last_name'
    );
    
    -- Assign admin role to specific email, otherwise user role
    IF NEW.email = 'info@carbonus.lt' THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'admin'::app_role);
    ELSE
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'user'::app_role);
    END IF;
    
    RETURN NEW;
END;
$$;