/*
================================================================================
COMPLETE DATABASE SCHEMA FOR FACULTY EDUCATION PLATFORM
================================================================================

This is a comprehensive SQL schema for setting up a complete educational 
resource platform with:
- User profiles and role-based access control
- Subjects and lessons/tutorials
- Modules and hierarchical content organization
- Tagging system for content categorization
- Bookmarks for user favorites
- Upload queue for content moderation
- Row-Level Security (RLS) policies for data protection

Created: December 21, 2025
Last Updated: Complete schema with all migrations
================================================================================
*/

-- ============================================================================
-- 1. CREATE ENUM TYPES
-- ============================================================================

-- User role enumeration
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'teacher', 'moderator', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Upload status enumeration
DO $$ BEGIN
  CREATE TYPE upload_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Resource type enumeration
DO $$ BEGIN
  CREATE TYPE resource_type AS ENUM ('lesson', 'pdf', 'book', 'link', 'document');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2. CREATE CORE TABLES
-- ============================================================================

-- Profiles table - Extended user information with roles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subjects table - Academic subjects/categories
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Lessons table - Main content (lessons/tutorials)
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  semester text,
  pdf_url text,
  external_link text,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  views integer DEFAULT 0,
  is_published boolean DEFAULT false,
  is_premium boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tags table - Content categorization tags
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Lesson tags junction table - Many-to-many relationship
CREATE TABLE IF NOT EXISTS lesson_tags (
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (lesson_id, tag_id)
);

-- Bookmarks table - User favorites
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Uploads table - Content awaiting approval
CREATE TABLE IF NOT EXISTS uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  suggested_subject_name text,
  semester text,
  pdf_url text,
  external_link text,
  tags text[],
  uploader_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status upload_status DEFAULT 'pending',
  admin_notes text,
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Modules table - Hierarchical content organization
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(subject_id, slug)
);

-- Resources table - Resources within modules
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  resource_type resource_type DEFAULT 'lesson',
  content text,
  pdf_url text,
  external_link text,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  is_published boolean DEFAULT false,
  is_premium boolean DEFAULT false,
  order_index integer DEFAULT 0,
  views integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(module_id, slug)
);

-- Resource tags junction table
CREATE TABLE IF NOT EXISTS resource_tags (
  resource_id uuid NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_id, tag_id)
);

-- ============================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_lessons_subject ON lessons(subject_id);
CREATE INDEX IF NOT EXISTS idx_lessons_author ON lessons(author_id);
CREATE INDEX IF NOT EXISTS idx_lessons_published ON lessons(is_published);
CREATE INDEX IF NOT EXISTS idx_lessons_slug ON lessons(slug);
CREATE INDEX IF NOT EXISTS idx_lessons_subject_order ON lessons(subject_id, order_index);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_lesson ON bookmarks(lesson_id);

CREATE INDEX IF NOT EXISTS idx_uploads_status ON uploads(status);
CREATE INDEX IF NOT EXISTS idx_uploads_uploader ON uploads(uploader_id);

CREATE INDEX IF NOT EXISTS idx_modules_subject ON modules(subject_id);

CREATE INDEX IF NOT EXISTS idx_resources_module ON resources(module_id);
CREATE INDEX IF NOT EXISTS idx_resources_subject ON resources(subject_id);
CREATE INDEX IF NOT EXISTS idx_resources_author ON resources(author_id);
CREATE INDEX IF NOT EXISTS idx_resources_published ON resources(is_published);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(resource_type);

CREATE INDEX IF NOT EXISTS idx_resource_tags_resource ON resource_tags(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_tags_tag ON resource_tags(tag_id);

-- ============================================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_tags ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. RLS POLICIES FOR PROFILES
-- ============================================================================

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
        AND profiles.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
        AND profiles.is_active = true
    )
  );

-- ============================================================================
-- 6. RLS POLICIES FOR SUBJECTS
-- ============================================================================

CREATE POLICY "Subjects are viewable by everyone"
  ON subjects FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Only admins can insert subjects"
  ON subjects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update subjects"
  ON subjects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete subjects"
  ON subjects FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 7. RLS POLICIES FOR LESSONS
-- ============================================================================

CREATE POLICY "Published lessons are viewable by everyone"
  ON lessons FOR SELECT
  TO authenticated, anon
  USING (is_published = true);

CREATE POLICY "Admins can view all lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Authors can view own unpublished lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Teachers, moderators and admins can insert lessons"
  ON lessons FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('teacher', 'moderator', 'admin')
    )
  );

CREATE POLICY "Authors and admins can update lessons"
  ON lessons FOR UPDATE
  TO authenticated
  USING (
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Authors and admins can delete lessons"
  ON lessons FOR DELETE
  TO authenticated
  USING (
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 8. RLS POLICIES FOR TAGS
-- ============================================================================

CREATE POLICY "Tags are viewable by everyone"
  ON tags FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can insert tags"
  ON tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 9. RLS POLICIES FOR LESSON TAGS
-- ============================================================================

CREATE POLICY "Lesson tags are viewable by everyone"
  ON lesson_tags FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Teachers, moderators and admins can manage lesson tags"
  ON lesson_tags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('teacher', 'moderator', 'admin')
        AND profiles.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('teacher', 'moderator', 'admin')
        AND profiles.is_active = true
    )
  );

-- ============================================================================
-- 10. RLS POLICIES FOR BOOKMARKS
-- ============================================================================

CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own bookmarks"
  ON bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- 11. RLS POLICIES FOR UPLOADS
-- ============================================================================

CREATE POLICY "Users can view own uploads"
  ON uploads FOR SELECT
  TO authenticated
  USING (uploader_id = auth.uid());

CREATE POLICY "Admins and moderators can view all uploads"
  ON uploads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'moderator')
        AND profiles.is_active = true
    )
  );

CREATE POLICY "Authenticated users can create uploads"
  ON uploads FOR INSERT
  TO authenticated
  WITH CHECK (uploader_id = auth.uid());

CREATE POLICY "Moderators and admins can update uploads"
  ON uploads FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('moderator', 'admin')
        AND profiles.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('moderator', 'admin')
        AND profiles.is_active = true
    )
  );

CREATE POLICY "Users can delete own uploads"
  ON uploads FOR DELETE
  TO authenticated
  USING (uploader_id = auth.uid());

CREATE POLICY "Moderators and admins can delete any upload"
  ON uploads FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('moderator', 'admin')
        AND profiles.is_active = true
    )
  );

-- ============================================================================
-- 12. RLS POLICIES FOR MODULES
-- ============================================================================

CREATE POLICY "Modules are publicly readable" ON modules
  FOR SELECT USING (true);

CREATE POLICY "Teachers and admins can create modules" ON modules
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers and admins can update modules" ON modules
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('teacher', 'admin')
    )
  );

-- ============================================================================
-- 13. RLS POLICIES FOR RESOURCES
-- ============================================================================

CREATE POLICY "Resources are publicly readable if published" ON resources
  FOR SELECT USING (is_published OR auth.uid() = author_id);

CREATE POLICY "Teachers and admins can create resources" ON resources
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('teacher', 'admin')
    ) AND
    auth.uid() = author_id
  );

CREATE POLICY "Authors and admins can update resources" ON resources
  FOR UPDATE USING (
    auth.uid() = author_id OR
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- ============================================================================
-- 14. RLS POLICIES FOR RESOURCE TAGS
-- ============================================================================

CREATE POLICY "Resource tags are publicly readable" ON resource_tags
  FOR SELECT USING (true);

CREATE POLICY "Authors can manage resource tags" ON resource_tags
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT author_id FROM resources WHERE id = resource_id
    ) OR
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- ============================================================================
-- 15. TRIGGER FUNCTIONS
-- ============================================================================

-- Function to automatically create profile on signup
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
  -- If anything fails, create profile with student role
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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 16. TRIGGERS
-- ============================================================================

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_modules_updated_at ON modules;
CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 17. SAMPLE DATA (Optional - Comment out if not needed)
-- ============================================================================

-- Insert sample subjects
-- INSERT INTO subjects (name, slug, description, order_index) VALUES
--   ('Mathematics', 'mathematics', 'Mathematics tutorials and lessons', 1),
--   ('Science', 'science', 'Science education resources', 2),
--   ('English', 'english', 'English language and literature', 3),
--   ('History', 'history', 'History and social studies', 4),
--   ('Technology', 'technology', 'Technology and computer science', 5);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
