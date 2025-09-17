/*
  # Fix Certificate Policy Syntax
  
  1. Changes
    - Drop existing policy with syntax error
    - Create new policy with correct syntax
  
  2. Security
    - Maintain same access control rules
    - Ensure users can view their own certificates
    - Allow admins to view all certificates
*/

-- Drop the existing policy with syntax error
DROP POLICY IF EXISTS "Users can view own certificates" ON course_certificates;

-- Create a new policy with correct syntax
CREATE POLICY "Users can view own certificates"
  ON course_certificates
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    external_user_id IN (
      SELECT id FROM external_enrollments WHERE email = auth.jwt()->>'email'
    ) OR 
    external_email = auth.jwt()->>'email' OR
    is_admin()
  );