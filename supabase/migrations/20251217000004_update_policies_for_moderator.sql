-- Update RLS policies to use moderator instead of teacher for upload management
-- This must be run AFTER the enum value is committed

-- Drop old policy
DROP POLICY IF EXISTS "Moderators and admins can update uploads" ON uploads;

-- Create new policy for moderators and admins
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

-- Update policy for admins to view all uploads (moderators can only see what they need)
DROP POLICY IF EXISTS "Admins can view all uploads" ON uploads;
DROP POLICY IF EXISTS "Admins and moderators can view all uploads" ON uploads;
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

-- Update delete policies to allow moderators
DROP POLICY IF EXISTS "Admins can delete any upload" ON uploads;
DROP POLICY IF EXISTS "Moderators and admins can delete any upload" ON uploads;
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

-- Update lesson_tags policy (keep teacher for now, but moderators can also manage)
DROP POLICY IF EXISTS "Teachers and admins can manage lesson tags" ON lesson_tags;
DROP POLICY IF EXISTS "Teachers, moderators and admins can manage lesson tags" ON lesson_tags;
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

-- Update lessons policy to allow moderators
DROP POLICY IF EXISTS "Teachers and admins can insert lessons" ON lessons;
DROP POLICY IF EXISTS "Teachers, moderators and admins can insert lessons" ON lessons;
CREATE POLICY "Teachers, moderators and admins can insert lessons"
  ON lessons FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('teacher', 'moderator', 'admin')
        AND profiles.is_active = true
    )
  );

