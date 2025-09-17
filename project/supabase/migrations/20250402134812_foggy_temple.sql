/*
  # Fix Certificate User ID Constraint
  
  1. Changes
    - Remove NOT NULL constraint from user_id in course_certificates
    - Update certificate_user_check constraint to properly handle external users
  
  2. Security
    - Maintain data integrity with improved constraint
    - Ensure proper validation for all certificate types
*/

-- Remove NOT NULL constraint from user_id in course_certificates
ALTER TABLE course_certificates 
ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing constraint if it exists
ALTER TABLE course_certificates
DROP CONSTRAINT IF EXISTS certificates_user_check;

-- Add the constraint to ensure at least one user identifier is provided
ALTER TABLE course_certificates
ADD CONSTRAINT certificates_user_check 
CHECK (
  (user_id IS NOT NULL AND external_user_id IS NULL AND external_email IS NULL) OR
  (user_id IS NULL AND external_user_id IS NOT NULL AND external_email IS NULL) OR
  (user_id IS NULL AND external_user_id IS NULL AND external_email IS NOT NULL)
);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT certificates_user_check ON course_certificates IS 
'Ensures exactly one user identifier (user_id, external_user_id, or external_email) is provided';