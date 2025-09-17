/*
  # Add PDF Generation Support for Certificates
  
  1. Changes
    - Add PDF URL and generation status to certificates
    - Add PDF template storage
    - Add PDF generation queue table
  
  2. Security
    - Enable RLS on new tables
    - Add appropriate policies
*/

-- Add PDF-related columns to course_certificates
ALTER TABLE course_certificates
ADD COLUMN IF NOT EXISTS pdf_status text DEFAULT 'pending' CHECK (pdf_status IN ('pending', 'generating', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS pdf_url text,
ADD COLUMN IF NOT EXISTS pdf_error text;

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
ALTER TABLE certificate_pdf_queue ENABLE ROW LEVEL SECURITY;

-- Create policies for PDF queue
CREATE POLICY "Admins can manage PDF queue"
  ON certificate_pdf_queue
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_certificates_pdf_status ON course_certificates(pdf_status);
CREATE INDEX IF NOT EXISTS idx_pdf_queue_status ON certificate_pdf_queue(status);
CREATE INDEX IF NOT EXISTS idx_pdf_queue_certificate ON certificate_pdf_queue(certificate_id);

-- Add comments
COMMENT ON COLUMN course_certificates.pdf_status IS 'Status of PDF generation process';
COMMENT ON COLUMN course_certificates.pdf_url IS 'URL to download generated PDF certificate';
COMMENT ON COLUMN course_certificates.pdf_error IS 'Error message if PDF generation failed';
COMMENT ON TABLE certificate_pdf_queue IS 'Queue for asynchronous PDF certificate generation';