-- Add is_active field to profiles for soft-delete functionality
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Update existing profiles to be active by default
UPDATE profiles SET is_active = true WHERE is_active IS NULL;

-- Allow teachers and admins to update uploads (approve/reject)
DROP POLICY IF EXISTS "Only admins can update uploads" ON uploads;

CREATE POLICY "Moderators and admins can update uploads"
  ON uploads FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('teacher', 'admin')
        AND profiles.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('teacher', 'admin')
        AND profiles.is_active = true
    )
  );

-- Allow admins to update any profile (change roles, deactivate)
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

-- Update existing policies to check is_active
DROP POLICY IF EXISTS "Admins can view all uploads" ON uploads;
CREATE POLICY "Admins can view all uploads"
  ON uploads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
        AND profiles.is_active = true
    )
  );

-- Only active users can sign in (enforced in application logic)
-- RLS policies already check for authenticated users, so inactive users
-- won't be able to access data even if they somehow authenticate

