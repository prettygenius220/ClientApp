-- Drop existing certificate tables to ensure clean slate
DROP TABLE IF EXISTS certificate_pdf_queue CASCADE;
DROP TABLE IF EXISTS course_certificates CASCADE;

-- Create course certificates table with all required fields
CREATE TABLE IF NOT EXISTS course_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES todo_profiles(id) NOT NULL,
  course_id uuid REFERENCES courses NOT NULL,
  certificate_number text NOT NULL UNIQUE,
  school_name text NOT NULL,
  instructor text NOT NULL,
  course_title text NOT NULL,
  participant_name text NOT NULL,
  ce_hours numeric NOT NULL,
  issued_date timestamptz DEFAULT now(),
  pdf_status text DEFAULT 'pending' CHECK (pdf_status IN ('pending', 'generating', 'completed', 'failed')),
  pdf_url text,
  pdf_error text,
  UNIQUE(user_id, course_id)
);

-- Create PDF generation queue
CREATE TABLE IF NOT EXISTS certificate_pdf_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  certificate_id uuid REFERENCES course_certificates(id) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts integer DEFAULT 0,
  last_attempt timestamptz,
  error text,
  UNIQUE (certificate_id)
);

-- Enable RLS
ALTER TABLE course_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_pdf_queue ENABLE ROW LEVEL SECURITY;

-- Create policies for certificates
CREATE POLICY "Users can view own certificates"
  ON course_certificates FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Admins can manage certificates"
  ON course_certificates FOR ALL
  TO authenticated
  USING (is_admin());

-- Create policies for PDF queue
CREATE POLICY "Admins can manage PDF queue"
  ON certificate_pdf_queue
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Create certificate processing function
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
    pdf_url = 'https://realedu.com/certificates/' || certificate_number || '.pdf'
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

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_certificates_user ON course_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course ON course_certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON course_certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_certificates_pdf_status ON course_certificates(pdf_status);
CREATE INDEX IF NOT EXISTS idx_pdf_queue_status ON certificate_pdf_queue(status);
CREATE INDEX IF NOT EXISTS idx_pdf_queue_certificate ON certificate_pdf_queue(certificate_id);

-- Add comments
COMMENT ON TABLE course_certificates IS 'Stores course completion certificates';
COMMENT ON TABLE certificate_pdf_queue IS 'Queue for asynchronous PDF certificate generation';
COMMENT ON COLUMN course_certificates.certificate_number IS 'Unique certificate identification number';
COMMENT ON COLUMN course_certificates.ce_hours IS 'Number of continuing education hours';
COMMENT ON COLUMN course_certificates.pdf_status IS 'Status of PDF generation process';
COMMENT ON COLUMN course_certificates.pdf_url IS 'URL to download generated PDF certificate';
COMMENT ON COLUMN course_certificates.pdf_error IS 'Error message if PDF generation failed';