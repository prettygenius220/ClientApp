/*
  # Fix Certificate View Policy
  
  1. Changes
    - Drop existing policy for viewing certificates
    - Create new policy with correct syntax
    - Maintain same access control logic
  
  2. Security
    - Preserve existing access control rules
    - Ensure users can view their own certificates
    - Allow viewing of certificates for external users
*/

-- Drop the existing policy
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
    is_admin()
  );