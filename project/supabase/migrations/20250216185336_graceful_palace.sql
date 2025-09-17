/*
  # Fix Admin Role Access

  1. Changes
    - Add admin bypass policies for all tables
    - Simplify admin role checks
    - Grant full access to admins
  
  2. Security
    - Maintains existing user policies
    - Adds separate admin policies
    - Preserves RLS protection
*/

-- Drop existing admin-related policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON todo_profiles;

-- Create new admin policies for todo_profiles
CREATE POLICY "Admins have full access to profiles"
  ON todo_profiles
  FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM todo_profiles WHERE id = auth.uid()) = 'admin'
  );

-- Create admin policies for todo_folders
CREATE POLICY "Admins have full access to folders"
  ON todo_folders
  FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM todo_profiles WHERE id = auth.uid()) = 'admin'
  );

-- Create admin policies for todos
CREATE POLICY "Admins have full access to todos"
  ON todos
  FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM todo_profiles WHERE id = auth.uid()) = 'admin'
  );

-- Create admin policies for preferences
CREATE POLICY "Admins have full access to preferences"
  ON todo_user_preferences
  FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM todo_profiles WHERE id = auth.uid()) = 'admin'
  );

-- Add comment explaining admin access
COMMENT ON TABLE todo_profiles IS 'Public profiles for users with essential information. Admins have full access to all profiles.';