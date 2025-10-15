-- Update user roles
-- 1. Change superadmin@willydreams.com from user to superadmin
-- 2. Change admin@example.com from superadmin to user

-- Get role IDs
-- user role id
-- superadmin role id

-- Update superadmin@willydreams.com to superadmin role
UPDATE user_roles
SET role_id = (SELECT id FROM roles WHERE name = 'superadmin')
WHERE user_id = (SELECT id FROM users WHERE email = 'superadmin@willydreams.com');

-- Update admin@example.com to user role
UPDATE user_roles
SET role_id = (SELECT id FROM roles WHERE name = 'user')
WHERE user_id = (SELECT id FROM users WHERE email = 'admin@example.com');

-- Verify changes
SELECT 
  u.email,
  u.name,
  r.name as role_name,
  r.level as role_level
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.email IN ('superadmin@willydreams.com', 'admin@example.com')
ORDER BY u.email;
