/*
  # Add name fields to user profiles
  
  1. Changes
    - Add first_name and last_name columns to todo_profiles
    - Add computed full_name column
    - Add indexes for name fields
  
  2. Features
    - Automatic full name generation
    - Case-insensitive name search
    - Proper indexing for performance
*/

-- Add name columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'todo_profiles' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE todo_profiles 
    ADD COLUMN first_name text;
  END IF;

  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'todo_profiles' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE todo_profiles 
    ADD COLUMN last_name text;
  END IF;
END $$;

-- Add computed full_name column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'todo_profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE todo_profiles 
    ADD COLUMN full_name text GENERATED ALWAYS AS (
      CASE
        WHEN first_name IS NOT NULL AND last_name IS NOT NULL THEN first_name || ' ' || last_name
        WHEN first_name IS NOT NULL THEN first_name
        WHEN last_name IS NOT NULL THEN last_name
        ELSE NULL
      END
    ) STORED;
  END IF;
END $$;

-- Add indexes for name fields
CREATE INDEX IF NOT EXISTS idx_todo_profiles_first_name ON todo_profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_todo_profiles_last_name ON todo_profiles(last_name);
CREATE INDEX IF NOT EXISTS idx_todo_profiles_full_name ON todo_profiles(full_name);

-- Add case-insensitive indexes for better search
CREATE INDEX IF NOT EXISTS idx_todo_profiles_first_name_lower ON todo_profiles(lower(first_name));
CREATE INDEX IF NOT EXISTS idx_todo_profiles_last_name_lower ON todo_profiles(lower(last_name));
CREATE INDEX IF NOT EXISTS idx_todo_profiles_full_name_lower ON todo_profiles(lower(full_name));

-- Add comments
COMMENT ON COLUMN todo_profiles.first_name IS 'User''s first name';
COMMENT ON COLUMN todo_profiles.last_name IS 'User''s last name';
COMMENT ON COLUMN todo_profiles.full_name IS 'Computed full name from first and last name';