-- Drop existing functions and triggers
DROP TRIGGER IF EXISTS process_certificate_trigger ON certificate_pdf_queue;
DROP FUNCTION IF EXISTS auto_process_certificate();
DROP FUNCTION IF EXISTS process_certificate_queue();

-- Create improved certificate processing function with correct URL format
CREATE OR REPLACE FUNCTION process_certificate_queue()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  base_url text := 'https://realedu.com/certificates/';
BEGIN
  -- Update certificates that are in the queue
  UPDATE course_certificates
  SET 
    pdf_status = 'completed',
    pdf_url = base_url || certificate_number || '.pdf'
  WHERE id IN (
    SELECT certificate_id 
    FROM certificate_pdf_queue 
    WHERE status = 'pending'
  )
  AND pdf_status = 'pending';

  -- Mark queue items as completed
  UPDATE certificate_pdf_queue
  SET 
    status = 'completed',
    last_attempt = now()
  WHERE status = 'pending';
END;
$$;

-- Create immediate processing trigger
CREATE OR REPLACE FUNCTION auto_process_certificate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Immediately process the certificate
  UPDATE course_certificates
  SET 
    pdf_status = 'completed',
    pdf_url = 'https://realedu.com/certificates/' || certificate_number || '.pdf'
  WHERE id = NEW.certificate_id
  AND pdf_status = 'pending';

  -- Mark queue item as completed
  NEW.status := 'completed';
  NEW.last_attempt := now();
  
  RETURN NEW;
END;
$$;

-- Add trigger for immediate processing
CREATE TRIGGER process_certificate_trigger
  BEFORE INSERT ON certificate_pdf_queue
  FOR EACH ROW
  EXECUTE FUNCTION auto_process_certificate();

-- Update existing certificates with correct URL format
UPDATE course_certificates
SET pdf_url = 'https://realedu.com/certificates/' || certificate_number || '.pdf'
WHERE pdf_url LIKE '%storage.googleapis.com%';

-- Process any existing pending certificates
SELECT process_certificate_queue();

-- Add helpful comments
COMMENT ON FUNCTION process_certificate_queue IS 'Processes pending certificates in the queue with correct URL format';
COMMENT ON FUNCTION auto_process_certificate IS 'Trigger function for immediate certificate processing with correct URL';