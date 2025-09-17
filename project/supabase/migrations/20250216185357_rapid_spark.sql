/*
  # Fix RLS Policy Recursion

  1. Changes
    - Remove recursive admin role checks
    - Implement efficient policy structure
    - Maintain security while preventing infinite recursion
  
  2. Security
    - Preserves admin access
    - Maintains data protection
    - Eliminates policy recursion
*/

-- First, drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Admins have full access to profiles" ON todo_profiles;
DROP POLICY IF EXISTS "Admins have full access to folders" ON todo_folders;
DROP POLICY IF EXISTS "Admins have full access to todos" ON todos;
DROP POLICY IF EXISTS "Admins have full access to preferences" ON todo_user_preferences;

-- Create a secure admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM todo_profiles WHERE id = auth.uid();
  RETURN user_role = 'admin';
END;
$$;

-- Update todo_profiles policies
CREATE POLICY "Users can view and manage profiles"
  ON todo_profiles
  FOR ALL
  TO authenticated
  USING (
    id = auth.uid() OR
    is_admin()
  );

-- Update todo_folders policies
CREATE POLICY "Users can manage folders"
  ON todo_folders
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    auth.uid() = ANY(shared_with) OR
    is_admin()
  );

-- Update todos policies
CREATE POLICY "Users can manage todos"
  ON todos
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    auth.uid() = ANY(shared_with) OR
    folder_id IN (
      SELECT id FROM todo_folders
      WHERE auth.uid() = ANY(shared_with)
    ) OR
    is_admin()
  );

-- Update preferences policies
CREATE POLICY "Users can manage preferences"
  ON todo_user_preferences
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    is_admin()
  );

-- Add helpful comments
COMMENT ON FUNCTION is_admin IS 'Checks if the current user has admin role';
COMMENT ON TABLE todo_profiles IS 'Public profiles for users with essential information. Access controlled by RLS policies.';