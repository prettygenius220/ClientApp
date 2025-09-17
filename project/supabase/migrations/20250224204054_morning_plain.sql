/*
  # Update Courses Table for Virtual Sessions

  1. Changes
    - Add virtual course fields (meet link, times)
    - Add isVirtual flag
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add virtual course fields
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS is_virtual boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS meet_link text,
ADD COLUMN IF NOT EXISTS start_time timestamptz,
ADD COLUMN IF NOT EXISTS end_time timestamptz;

-- Add comments
COMMENT ON COLUMN courses.is_virtual IS 'Whether the course is taught virtually';
COMMENT ON COLUMN courses.meet_link IS 'Google Meet link for virtual sessions';
COMMENT ON COLUMN courses.start_time IS 'Course session start time';
COMMENT ON COLUMN courses.end_time IS 'Course session end time';