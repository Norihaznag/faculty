/*
================================================================================
SETUP GUIDE - CREATING TEST USERS & PROFILES
================================================================================

If you're getting "Database error creating new user" when trying to create 
auth users in Supabase, this script will help you set up test users directly.

OPTION 1: Manual Setup in Supabase Dashboard (Easiest)
======================================================
1. Go to: Supabase Dashboard → Authentication → Users
2. Click "Add user" button
3. Enter email and password
4. Click "Create user"
5. Repeat for all 6 test emails

If the dashboard method works, skip to "VERIFY PROFILES CREATED" below.

OPTION 2: If Auth User Creation Still Fails
=============================================
The issue might be with Row-Level Security (RLS) policies on the profiles table.
Run this SQL in your database SQL editor to fix it:
*/

-- Temporarily disable RLS to allow profile creation
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Temporarily drop the foreign key constraint
ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;

-- Now create test profiles directly:
INSERT INTO profiles (id, email, full_name, role, is_active, created_at, updated_at) VALUES
  (gen_random_uuid(), 'teacher1@faculty.edu', 'Dr. Sarah Johnson', 'teacher'::user_role, true, now(), now()),
  (gen_random_uuid(), 'teacher2@faculty.edu', 'Prof. Michael Chen', 'teacher'::user_role, true, now(), now()),
  (gen_random_uuid(), 'teacher3@faculty.edu', 'Dr. Emma Wilson', 'teacher'::user_role, true, now(), now()),
  (gen_random_uuid(), 'admin@faculty.edu', 'Admin User', 'admin'::user_role, true, now(), now()),
  (gen_random_uuid(), 'student1@faculty.edu', 'Alex Smith', 'student'::user_role, true, now(), now()),
  (gen_random_uuid(), 'student2@faculty.edu', 'Jordan Davis', 'student'::user_role, true, now(), now());

-- Re-add the foreign key constraint
ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

/*
OPTION 3: Create Minimal Test Profiles (No Auth Required)
===========================================================
If you want to skip auth users entirely and just test the content display:
Run the SEED_DUMMY_DATA.sql as-is. It will work with just the profiles 
created above, even without linked auth.users accounts.
*/

-- ============================================================================
-- VERIFY PROFILES CREATED
-- ============================================================================

-- Run this to verify profiles exist:
-- SELECT id, email, full_name, role, is_active FROM profiles WHERE email LIKE '%@faculty.edu%';

-- Expected output should show 6 rows with the test accounts.

/*
NEXT STEPS AFTER PROFILES ARE CREATED
======================================
1. Run SEED_DUMMY_DATA.sql to populate content
2. View your site - you should see lessons, modules, bookmarks, etc.
3. The auth system will work with or without linked Supabase Auth users

NOTE: If you want full auth functionality (login/signup):
- The trigger will auto-create profiles when new auth users sign up
- Existing profiles can be linked manually by ensuring emails match
*/
