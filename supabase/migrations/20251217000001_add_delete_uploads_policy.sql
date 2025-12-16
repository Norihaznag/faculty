-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own uploads"
  ON uploads FOR DELETE
  TO authenticated
  USING (uploader_id = auth.uid());

-- Allow admins to delete any upload
CREATE POLICY "Admins can delete any upload"
  ON uploads FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

