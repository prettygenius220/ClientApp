/*
  # Add test users
  
  1. Changes
    - Add test users with same password
    - Set user roles
    - Create profiles
  
  2. Security
    - Uses secure password hashing
    - Sets proper user roles
*/

-- Create test users with password: Test123!@#
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmed_at
) VALUES
  -- Admin user
  (
    'e52c5a84-e2b5-4235-9c2f-2445c43bc757',
    '00000000-0000-0000-0000-000000000000',
    'admin@realedu.com',
    '$2a$10$Q9UeC.r6yZZyxz1592nZeOyNS.V3w8yg/mF/AqhYa9J3TwAwqIyWi',
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    now()
  ),
  -- Regular users
  (
    'f8b9d831-42b9-4678-8d98-a6e5c4f45421',
    '00000000-0000-0000-0000-000000000000',
    'student1@realedu.com',
    '$2a$10$Q9UeC.r6yZZyxz1592nZeOyNS.V3w8yg/mF/AqhYa9J3TwAwqIyWi',
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    now()
  ),
  (
    'c4b2a45d-e68c-4d42-a876-9c9e6b3fd7c9',
    '00000000-0000-0000-0000-000000000000',
    'student2@realedu.com',
    '$2a$10$Q9UeC.r6yZZyxz1592nZeOyNS.V3w8yg/mF/AqhYa9J3TwAwqIyWi',
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    now()
  );

-- Create profiles with roles
INSERT INTO todo_profiles (id, email, role)
VALUES
  ('e52c5a84-e2b5-4235-9c2f-2445c43bc757', 'admin@realedu.com', 'admin'),
  ('f8b9d831-42b9-4678-8d98-a6e5c4f45421', 'student1@realedu.com', 'user'),
  ('c4b2a45d-e68c-4d42-a876-9c9e6b3fd7c9', 'student2@realedu.com', 'user');

-- Add helpful comments
COMMENT ON TABLE auth.users IS 'Auth: Stores user login credentials and related data';
COMMENT ON TABLE todo_profiles IS 'Stores user profile information and role assignments';