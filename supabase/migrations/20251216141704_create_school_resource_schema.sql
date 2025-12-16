/*
  # School Resource Platform Schema

  ## Overview
  Complete database schema for a W3Schools-style educational resource platform with user roles, content management, and approval workflow.

  ## New Tables
  
  ### 1. `profiles`
  Extended user profile with role management
  - `id` (uuid, FK to auth.users)
  - `email` (text)
  - `full_name` (text)
  - `role` (enum: student, teacher, admin)
  - `avatar_url` (text, optional)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `subjects`
  Academic subjects/categories
  - `id` (uuid, PK)
  - `name` (text)
  - `slug` (text, unique)
  - `description` (text)
  - `icon` (text, optional)
  - `order_index` (integer)
  - `created_at` (timestamptz)

  ### 3. `lessons`
  Main content - lessons/tutorials
  - `id` (uuid, PK)
  - `title` (text)
  - `slug` (text, unique)
  - `content` (text, markdown/html)
  - `subject_id` (uuid, FK)
  - `semester` (text, optional)
  - `pdf_url` (text, optional)
  - `external_link` (text, optional)
  - `author_id` (uuid, FK to profiles)
  - `views` (integer)
  - `is_published` (boolean)
  - `is_premium` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `tags`
  Tags for categorization
  - `id` (uuid, PK)
  - `name` (text, unique)
  - `slug` (text, unique)
  - `created_at` (timestamptz)

  ### 5. `lesson_tags`
  Many-to-many relationship between lessons and tags
  - `lesson_id` (uuid, FK)
  - `tag_id` (uuid, FK)
  - Primary key: (lesson_id, tag_id)

  ### 6. `bookmarks`
  User bookmarks for lessons
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles)
  - `lesson_id` (uuid, FK to lessons)
  - `created_at` (timestamptz)
  - Unique constraint: (user_id, lesson_id)

  ### 7. `uploads`
  Pending uploads awaiting admin approval
  - `id` (uuid, PK)
  - `title` (text)
  - `content` (text)
  - `subject_id` (uuid, FK)
  - `semester` (text, optional)
  - `pdf_url` (text, optional)
  - `external_link` (text, optional)
  - `tags` (text array)
  - `uploader_id` (uuid, FK to profiles)
  - `status` (enum: pending, approved, rejected)
  - `admin_notes` (text, optional)
  - `reviewed_by` (uuid, FK to profiles, optional)
  - `reviewed_at` (timestamptz, optional)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Profiles: Users can read all, update own
  - Subjects: Public read, admin write
  - Lessons: Public read published, admin/teacher write
  - Tags: Public read, admin write
  - Bookmarks: Users can CRUD own bookmarks
  - Uploads: Users can create/read own, admins can read/update all
*/

-- Create enum types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE upload_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create lessons table
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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create lesson_tags junction table
CREATE TABLE IF NOT EXISTS lesson_tags (
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (lesson_id, tag_id)
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Create uploads table
CREATE TABLE IF NOT EXISTS uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lessons_subject ON lessons(subject_id);
CREATE INDEX IF NOT EXISTS idx_lessons_author ON lessons(author_id);
CREATE INDEX IF NOT EXISTS idx_lessons_published ON lessons(is_published);
CREATE INDEX IF NOT EXISTS idx_lessons_slug ON lessons(slug);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_lesson ON bookmarks(lesson_id);
CREATE INDEX IF NOT EXISTS idx_uploads_status ON uploads(status);
CREATE INDEX IF NOT EXISTS idx_uploads_uploader ON uploads(uploader_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
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

-- RLS Policies for subjects
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

-- RLS Policies for lessons
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

CREATE POLICY "Teachers and admins can insert lessons"
  ON lessons FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('teacher', 'admin')
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

-- RLS Policies for tags
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

-- RLS Policies for lesson_tags
CREATE POLICY "Lesson tags are viewable by everyone"
  ON lesson_tags FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Teachers and admins can manage lesson tags"
  ON lesson_tags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('teacher', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('teacher', 'admin')
    )
  );

-- RLS Policies for bookmarks
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

-- RLS Policies for uploads
CREATE POLICY "Users can view own uploads"
  ON uploads FOR SELECT
  TO authenticated
  USING (uploader_id = auth.uid());

CREATE POLICY "Admins can view all uploads"
  ON uploads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can create uploads"
  ON uploads FOR INSERT
  TO authenticated
  WITH CHECK (uploader_id = auth.uid());

CREATE POLICY "Only admins can update uploads"
  ON uploads FOR UPDATE
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

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'::user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
