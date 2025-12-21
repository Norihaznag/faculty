/*
  # Supabase Auth Configuration Check
  
  ## Common causes of 500 errors in /auth/v1/signup:
  
  1. **Email Already Registered**
     - Try a different email address
     - Check Supabase Auth > Users for existing emails
  
  2. **Password Policy**
     - Password must be at least 6 characters
     - Some projects require stronger passwords (uppercase, numbers, special chars)
     - Check Auth > Policies in Supabase dashboard
  
  3. **Email Configuration**
     - Check if email verification is enabled
     - Verify SMTP settings if using custom emails
     - Check rate limiting for email sends
  
  4. **Project Settings**
     - Verify the project hasn't hit usage limits
     - Check API keys are correct
     - Verify CORS settings allow localhost
  
  ## Troubleshooting Steps:
  
  1. Check Supabase Logs:
     → Go to Supabase Dashboard
     → Select your project
     → Go to Logs > Auth
     → Look for signup requests and errors
  
  2. Verify Email Configuration:
     → Auth > Providers
     → Check Email is enabled
     → Verify email templates
  
  3. Check Password Requirements:
     → Auth > Policies
     → Verify password length requirements
  
  4. Test with Simple Credentials:
     → Email: test@example.com
     → Password: Testpassword123!
     → Name: Test User
     → Role: student
  
  5. Check Network Tab:
     → Open DevTools (F12)
     → Network tab
     → Click signup
     → Look at the POST request to /auth/v1/signup
     → Check Response tab for detailed error message
*/

-- Run this in Supabase SQL Editor to check database state:

-- Check if profiles table exists and has correct structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if there are any existing profiles (for testing)
SELECT 
  id, 
  email, 
  full_name, 
  role, 
  created_at
FROM profiles
LIMIT 10;

-- Check auth.users (visible only to admin)
-- SELECT id, email, created_at FROM auth.users LIMIT 10;

-- Test the trigger function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';
