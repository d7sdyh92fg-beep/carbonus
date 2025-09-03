-- Test the has_role function for the specific user
SELECT 
  u.email,
  u.id as user_id,
  ur.role,
  has_role(u.id, 'admin'::app_role) as has_admin_role
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'info@carbonus.lt';