/*
  # Add Certificate Reissue Functionality
  
  1. Changes
    - Add reissue tracking columns to course_certificates
    - Create reissue_certificate function for admins
    - Update certificate reissue history
  
  2. Features
    - Track number of reissues
    - Store reissue history with timestamps
    - Record who performed each reissue
*/

-- Add reissue tracking to course_certificates if not already added
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'course_certificates' AND column_name = 'reissue_count'
  ) THEN
    ALTER TABLE course_certificates
    ADD COLUMN reissue_count integer DEFAULT 0,
    ADD COLUMN last_reissued_at timestamptz,
    ADD COLUMN reissue_history jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create or replace function to handle certificate reissuing
CREATE OR REPLACE FUNCTION reissue_certificate(certificate_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cert_record course_certificates;
BEGIN
  -- Get the certificate record
  SELECT * INTO cert_record FROM course_certificates WHERE id = certificate_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Certificate not found';
  END IF;
  
  -- Update reissue history
  UPDATE course_certificates
  SET 
    reissue_count = COALESCE(reissue_count, 0) + 1,
    last_reissued_at = now(),
    issued_date = now(),
    reissue_history = jsonb_build_array(
      jsonb_build_object(
        'previous_date', issued_date,
        'reissued_at', now(),
        'reissued_by', auth.uid()
      )
    ) || COALESCE(reissue_history, '[]'::jsonb)
  WHERE id = certificate_id;
END;
$$;

-- Add comments
COMMENT ON COLUMN course_certificates.reissue_count IS 'Number of times this certificate has been reissued';
COMMENT ON COLUMN course_certificates.last_reissued_at IS 'Timestamp of the last reissue';
COMMENT ON COLUMN course_certificates.reissue_history IS 'History of reissues with previous dates and who reissued';
COMMENT ON FUNCTION reissue_certificate IS 'Reissues a certificate with a new date and tracks history';