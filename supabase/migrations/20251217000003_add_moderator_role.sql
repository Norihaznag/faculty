-- Add moderator role to user_role enum (if it doesn't exist)
-- Note: This must be in a separate transaction/statement
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'moderator' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    ALTER TYPE user_role ADD VALUE 'moderator';
  END IF;
END $$;

-- Commit the enum change before using it
-- The policies will be updated in migration 20251217000004_update_policies_for_moderator.sql

