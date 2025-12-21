/*
  # Fix handle_new_user trigger for robust profile creation
  
  ## Problem
  The original trigger function fails if:
  - The role value doesn't exist in the enum
  - The raw_user_meta_data is malformed
  - The casting fails silently
  
  ## Solution
  - Add proper CASE statement for role validation
  - Add exception handling with fallback to 'student' role
  - Ensure profile is always created even if data is incomplete
*/

-- Drop and recreate the function with better error handling
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE
      WHEN NEW.raw_user_meta_data->>'role' IN ('teacher', 'moderator', 'admin') 
        THEN (NEW.raw_user_meta_data->>'role')::user_role
      ELSE 'student'::user_role
    END
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- If anything fails, create profile with student role as fallback
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'student'::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify the function works
-- Test: SELECT * FROM profiles WHERE id = (SELECT id FROM auth.users LIMIT 1);
