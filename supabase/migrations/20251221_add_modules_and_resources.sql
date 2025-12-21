/*
  # Add Modules and Resources Schema

  ## Overview
  Extends the existing schema to support hierarchical content organization:
  Subjects -> Modules -> Resources

  ## New Tables

  ### 1. `modules`
  Modules within subjects
  - `id` (uuid, PK)
  - `subject_id` (uuid, FK)
  - `name` (text)
  - `slug` (text)
  - `description` (text, optional)
  - `order_index` (integer)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `resources`
  Resources within modules (books, PDFs, links, etc.)
  - `id` (uuid, PK)
  - `module_id` (uuid, FK)
  - `subject_id` (uuid, FK) - for direct access
  - `title` (text)
  - `slug` (text)
  - `description` (text, optional)
  - `resource_type` (enum: lesson, pdf, book, link, document)
  - `content` (text, optional - for lesson/document content)
  - `pdf_url` (text, optional)
  - `external_link` (text, optional)
  - `author_id` (uuid, FK)
  - `is_published` (boolean)
  - `is_premium` (boolean)
  - `order_index` (integer)
  - `views` (integer)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `resource_tags`
  Tags for resources (many-to-many with existing tags table)
  - `resource_id` (uuid, FK)
  - `tag_id` (uuid, FK)
  - Primary key: (resource_id, tag_id)
*/

-- Create enum for resource types
DO $$ BEGIN
  CREATE TYPE resource_type AS ENUM ('lesson', 'pdf', 'book', 'link', 'document');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create modules table
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

-- Create resources table
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

-- Create resource_tags junction table
CREATE TABLE IF NOT EXISTS resource_tags (
  resource_id uuid NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_id, tag_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_modules_subject ON modules(subject_id);
CREATE INDEX IF NOT EXISTS idx_resources_module ON resources(module_id);
CREATE INDEX IF NOT EXISTS idx_resources_subject ON resources(subject_id);
CREATE INDEX IF NOT EXISTS idx_resources_author ON resources(author_id);
CREATE INDEX IF NOT EXISTS idx_resources_published ON resources(is_published);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_resource_tags_resource ON resource_tags(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_tags_tag ON resource_tags(tag_id);

-- Enable RLS
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for modules
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

-- RLS Policies for resources
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

-- RLS Policies for resource_tags
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
