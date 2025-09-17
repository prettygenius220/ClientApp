/*
  # Add Password Reset Tokens Table
  
  1. New Tables
    - password_reset_tokens: Stores temporary tokens for password resets
  
  2. Security
    - Tokens expire after 1 hour
    - Tokens can only be used once
    - Admin-only access to token table
*/

-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  used_at timestamptz
);

-- Enable RLS
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage password reset tokens"
  ON password_reset_tokens
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Add comments
COMMENT ON TABLE password_reset_tokens IS 'Stores temporary tokens for password resets and magic links';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'When the token expires (typically 1 hour after creation)';
COMMENT ON COLUMN password_reset_tokens.used IS 'Whether the token has been used';
COMMENT ON COLUMN password_reset_tokens.used_at IS 'When the token was used';