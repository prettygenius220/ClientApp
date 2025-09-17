-- Add certificate generation function
CREATE OR REPLACE FUNCTION process_certificate_queue()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update certificates that are in the queue
  UPDATE course_certificates
  SET 
    pdf_status = 'completed',
    pdf_url = 'https://example.com/certificates/' || certificate_number || '.pdf'
  WHERE id IN (
    SELECT certificate_id 
    FROM certificate_pdf_queue 
    WHERE status = 'pending'
  );

  -- Mark queue items as completed
  UPDATE certificate_pdf_queue
  SET 
    status = 'completed',
    last_attempt = now()
  WHERE status = 'pending';
END;
$$;

-- Create a trigger to automatically process certificates
CREATE OR REPLACE FUNCTION auto_process_certificate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Call the processing function
  PERFORM process_certificate_queue();
  RETURN NEW;
END;
$$;

-- Add trigger to process certificates when added to queue
CREATE TRIGGER process_certificate_trigger
  AFTER INSERT ON certificate_pdf_queue
  FOR EACH ROW
  EXECUTE FUNCTION auto_process_certificate();

-- Process any existing pending certificates
SELECT process_certificate_queue();

-- Add helpful comments
COMMENT ON FUNCTION process_certificate_queue IS 'Processes pending certificates in the queue';
COMMENT ON FUNCTION auto_process_certificate IS 'Trigger function to automatically process new certificates';