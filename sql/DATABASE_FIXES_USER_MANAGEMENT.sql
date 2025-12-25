/*
================================================================================
DATABASE FIXES - USER MANAGEMENT & INITIALIZATION
================================================================================

This SQL script fixes common user management issues and initializes the database
with necessary triggers, functions, and sample data.

Execute this AFTER running DATABASE_SCHEMA_SUPABASE.sql
================================================================================
*/

-- ============================================================================
-- 1. CREATE TRIGGER FUNCTION FOR AUTO PROFILE CREATION
-- ============================================================================

-- Function to handle new user signup automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_active)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.user_metadata->>'full_name', split_part(new.email, '@', 1)),
    COALESCE((new.user_metadata->>'role')::user_role, 'student'::user_role),
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 2. CREATE TRIGGER FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- Function to auto-update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Apply to profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Apply to lessons
DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Apply to modules
DROP TRIGGER IF EXISTS update_modules_updated_at ON modules;
CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Apply to resources
DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 3. CREATE HELPER FUNCTIONS FOR USER MANAGEMENT
-- ============================================================================

-- Function to promote a user to admin
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(user_email text)
RETURNS TABLE (id uuid, email text, role user_role, message text)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Find user by email
  SELECT id INTO user_id FROM profiles WHERE email = user_email LIMIT 1;

  IF user_id IS NULL THEN
    RETURN QUERY SELECT NULL::uuid, user_email, NULL::user_role, 'User not found'::text;
    RETURN;
  END IF;

  -- Update role to admin
  UPDATE profiles SET role = 'admin'::user_role WHERE id = user_id;

  -- Return updated profile
  RETURN QUERY SELECT profiles.id, profiles.email, profiles.role, 'User promoted to admin'::text
  FROM profiles WHERE id = user_id;
END;
$$;

-- Function to demote admin to teacher
CREATE OR REPLACE FUNCTION public.demote_admin_to_teacher(user_email text)
RETURNS TABLE (id uuid, email text, role user_role, message text)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_id uuid;
BEGIN
  SELECT id INTO user_id FROM profiles WHERE email = user_email LIMIT 1;

  IF user_id IS NULL THEN
    RETURN QUERY SELECT NULL::uuid, user_email, NULL::user_role, 'User not found'::text;
    RETURN;
  END IF;

  UPDATE profiles SET role = 'teacher'::user_role WHERE id = user_id;

  RETURN QUERY SELECT profiles.id, profiles.email, profiles.role, 'User demoted to teacher'::text
  FROM profiles WHERE id = user_id;
END;
$$;

-- Function to delete a user and their data
CREATE OR REPLACE FUNCTION public.delete_user_cascade(user_email text)
RETURNS TABLE (id uuid, message text)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Find user
  SELECT id INTO user_id FROM profiles WHERE email = user_email LIMIT 1;

  IF user_id IS NULL THEN
    RETURN QUERY SELECT NULL::uuid, 'User not found'::text;
    RETURN;
  END IF;

  -- Delete from auth.users (which cascades to profiles)
  DELETE FROM auth.users WHERE id = user_id;

  RETURN QUERY SELECT user_id, 'User and all associated data deleted'::text;
END;
$$;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats()
RETURNS TABLE (
  total_users bigint,
  active_users bigint,
  admins bigint,
  teachers bigint,
  students bigint,
  total_bookmarks bigint,
  total_uploads bigint
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM profiles)::bigint,
    (SELECT COUNT(*) FROM profiles WHERE is_active = true)::bigint,
    (SELECT COUNT(*) FROM profiles WHERE role = 'admin'::user_role)::bigint,
    (SELECT COUNT(*) FROM profiles WHERE role = 'teacher'::user_role)::bigint,
    (SELECT COUNT(*) FROM profiles WHERE role = 'student'::user_role)::bigint,
    (SELECT COUNT(*) FROM bookmarks)::bigint,
    (SELECT COUNT(*) FROM uploads)::bigint;
END;
$$;

-- ============================================================================
-- 4. SAMPLE DATA INITIALIZATION (Optional)
-- ============================================================================

-- Insert sample subjects if they don't exist
INSERT INTO subjects (name, slug, description, order_index) VALUES
  ('Mathematics', 'mathematics', 'Learn mathematics from basics to advanced levels', 1),
  ('Physics', 'physics', 'Explore physics concepts and theories', 2),
  ('Chemistry', 'chemistry', 'Chemistry fundamentals and practical applications', 3),
  ('Biology', 'biology', 'Study living organisms and biological systems', 4),
  ('English', 'english', 'English language and literature', 5)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample tags if they don't exist
INSERT INTO tags (name, slug) VALUES
  ('beginner', 'beginner'),
  ('intermediate', 'intermediate'),
  ('advanced', 'advanced'),
  ('tutorial', 'tutorial'),
  ('reference', 'reference'),
  ('practice', 'practice')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 5. USEFUL QUERIES FOR MANAGEMENT
-- ============================================================================

-- Query 1: List all users with their roles
-- SELECT id, email, full_name, role, is_active, created_at FROM profiles ORDER BY created_at DESC;

-- Query 2: Find pending uploads
-- SELECT id, title, uploader_id, status, created_at FROM uploads WHERE status = 'pending' ORDER BY created_at DESC;

-- Query 3: Get user activity (bookmarks and uploads)
-- SELECT 
--   p.email, 
--   COUNT(DISTINCT b.id) as bookmark_count,
--   COUNT(DISTINCT u.id) as upload_count
-- FROM profiles p
-- LEFT JOIN bookmarks b ON p.id = b.user_id
-- LEFT JOIN uploads u ON p.id = u.uploader_id
-- GROUP BY p.id, p.email
-- ORDER BY bookmark_count DESC;

-- Query 4: Get most viewed lessons
-- SELECT id, title, subject_id, views FROM lessons WHERE is_published = true ORDER BY views DESC LIMIT 10;

-- Query 5: Deactivate inactive users (no activity in 90 days)
-- UPDATE profiles 
-- SET is_active = false
-- WHERE is_active = true 
--   AND id NOT IN (
--     SELECT DISTINCT user_id FROM bookmarks WHERE created_at > NOW() - INTERVAL '90 days'
--   )
--   AND created_at < NOW() - INTERVAL '90 days';

-- ============================================================================
-- 6. ADMIN FUNCTIONS FOR MANAGEMENT
-- ============================================================================

-- Function to recount lesson views (in case of inconsistency)
CREATE OR REPLACE FUNCTION public.recount_lesson_views()
RETURNS TABLE (lesson_id uuid, new_view_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- This is a placeholder - in production you'd track views in a separate table
  RETURN QUERY
  SELECT l.id, COUNT(*)::bigint
  FROM lessons l
  LEFT JOIN (SELECT lesson_id, COUNT(*) FROM bookmarks GROUP BY lesson_id) b ON l.id = b.lesson_id
  GROUP BY l.id;
END;
$$;

-- Function to archive old uploads (older than 6 months)
CREATE OR REPLACE FUNCTION public.archive_old_uploads()
RETURNS TABLE (archived_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  DELETE FROM uploads
  WHERE created_at < NOW() - INTERVAL '6 months'
    AND status != 'approved';
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  
  RETURN QUERY SELECT archived_count;
END;
$$;

-- ============================================================================
-- 7. GRANT PERMISSIONS
-- ============================================================================

-- Grant appropriate permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.promote_user_to_admin(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.demote_admin_to_teacher(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_cascade(text) TO authenticated;

-- ============================================================================
-- 8. VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify everything is set up correctly:

-- Check if trigger is active
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check all functions created
-- SELECT routine_name, routine_type FROM information_schema.routines WHERE routine_schema = 'public';

-- Check if triggers are active
-- SELECT trigger_name, event_manipulation, trigger_timing FROM information_schema.triggers WHERE trigger_schema = 'public';

/*
================================================================================
END OF DATABASE FIXES
================================================================================

TO USE THESE FUNCTIONS:

1. Promote user to admin:
   SELECT * FROM public.promote_user_to_admin('user@example.com');

2. Demote admin to teacher:
   SELECT * FROM public.demote_admin_to_teacher('user@example.com');

3. Delete user and all their data:
   SELECT * FROM public.delete_user_cascade('user@example.com');

4. Get database statistics:
   SELECT * FROM public.get_user_stats();

5. Archive old uploads:
   SELECT * FROM public.archive_old_uploads();

6. List all users:
   SELECT id, email, full_name, role, is_active, created_at FROM profiles ORDER BY created_at DESC;

7. Find pending uploads:
   SELECT id, title, uploader_id, status, created_at FROM uploads WHERE status = 'pending';
*/
