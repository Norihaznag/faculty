/*
================================================================================
ALTERNATIVE: CREATE AUTH USERS FIRST, THEN PROFILES
================================================================================

This approach creates auth.users first, then creates matching profiles.
Better for production-like setup.

STEP 1: Run this in Supabase SQL Editor to create auth users:
*/

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_sent_at
) VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'teacher1@faculty.edu', crypt('Teacher123!@#', gen_salt('bf')), now(), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'teacher2@faculty.edu', crypt('Teacher123!@#', gen_salt('bf')), now(), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'teacher3@faculty.edu', crypt('Teacher123!@#', gen_salt('bf')), now(), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'admin@faculty.edu', crypt('Admin123!@#', gen_salt('bf')), now(), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'student1@faculty.edu', crypt('Student123!@#', gen_salt('bf')), now(), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'student2@faculty.edu', crypt('Student123!@#', gen_salt('bf')), now(), now(), now(), now());

/*
STEP 2: The trigger will auto-create matching profiles.
        Verify with this query:
*/

-- SELECT id, email, full_name, role FROM profiles WHERE email LIKE '%@faculty.edu%';

/*
STEP 3: If profiles weren't auto-created, manually create them:
*/

INSERT INTO profiles (id, email, full_name, role, is_active)
SELECT id, email, split_part(email, '@', 1), 'student'::user_role, true
FROM auth.users
WHERE email LIKE '%@faculty.edu%'
ON CONFLICT (id) DO NOTHING;

-- Then update roles:
UPDATE profiles SET role = 'teacher'::user_role WHERE email LIKE 'teacher%@faculty.edu';
UPDATE profiles SET role = 'admin'::user_role WHERE email = 'admin@faculty.edu';
UPDATE profiles SET full_name = 'Dr. Sarah Johnson' WHERE email = 'teacher1@faculty.edu';
UPDATE profiles SET full_name = 'Prof. Michael Chen' WHERE email = 'teacher2@faculty.edu';
UPDATE profiles SET full_name = 'Dr. Emma Wilson' WHERE email = 'teacher3@faculty.edu';
UPDATE profiles SET full_name = 'Admin User' WHERE email = 'admin@faculty.edu';
UPDATE profiles SET full_name = 'Alex Smith' WHERE email = 'student1@faculty.edu';
UPDATE profiles SET full_name = 'Jordan Davis' WHERE email = 'student2@faculty.edu';
