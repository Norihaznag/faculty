-- Add suggested_subject_name field to uploads table
-- This allows users to suggest new subjects when uploading content
ALTER TABLE uploads 
ADD COLUMN IF NOT EXISTS suggested_subject_name text;

-- Add comment explaining the field
COMMENT ON COLUMN uploads.suggested_subject_name IS 'Subject name suggested by user when subject_id is null. Admin can create the subject and link it later.';

