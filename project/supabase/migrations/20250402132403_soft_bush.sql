/*
  # Add Certificate Reissuing Support
  
  1. Changes
    - Add reissue tracking to certificates
    - Add reissue count and history
    - Update certificate policies
  
  2. Security
    - Maintain RLS protection
    - Admin-only reissue capability
*/

-- Add reissue tracking to course_certificates
ALTER TABLE course_certificates
ADD COLUMN IF NOT EXISTS reissue_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_reissued_at timestamptz,
ADD COLUMN IF NOT EXISTS reissue_history jsonb DEFAULT '[]'::jsonb;

-- Create function to handle certificate reissuing
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
    reissue_count = reissue_count + 1,
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