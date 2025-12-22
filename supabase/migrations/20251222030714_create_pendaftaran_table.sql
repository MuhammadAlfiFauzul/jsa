/*
  # Create Pendaftaran (Registration) Table

  ## Overview
  This migration creates a secure table to store user registration data from the JSA Internet website registration form.

  ## Tables Created
  - `pendaftaran` - Stores customer registration requests
    - `id` (uuid, primary key) - Unique identifier for each registration
    - `nama` (text) - Customer's full name
    - `telp` (text) - Phone/WhatsApp number
    - `kota` (text) - City/Regency
    - `kecamatan` (text) - District
    - `kelurahan` (text) - Village/Sub-district
    - `alamat` (text) - Full address
    - `status` (text) - Registration status (pending, contacted, completed, rejected)
    - `created_at` (timestamptz) - Timestamp when registration was submitted
    - `updated_at` (timestamptz) - Timestamp when record was last updated

  ## Security
  - Enable Row Level Security (RLS) on `pendaftaran` table
  - Anonymous users can INSERT (submit registration form)
  - Only authenticated admin users can SELECT, UPDATE, DELETE
  - No public read access to protect customer privacy
  
  ## Important Notes
  - All customer data is protected by RLS
  - Registrations default to "pending" status
  - Timestamps are automatically managed
*/

-- Create pendaftaran table
CREATE TABLE IF NOT EXISTS pendaftaran (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  telp text NOT NULL,
  kota text NOT NULL,
  kecamatan text NOT NULL,
  kelurahan text NOT NULL,
  alamat text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE pendaftaran ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert registrations (public form submission)
CREATE POLICY "Allow public registration submissions"
  ON pendaftaran
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only authenticated users (admins) can view registrations
CREATE POLICY "Authenticated users can view all registrations"
  ON pendaftaran
  FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users (admins) can update registrations
CREATE POLICY "Authenticated users can update registrations"
  ON pendaftaran
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated users (admins) can delete registrations
CREATE POLICY "Authenticated users can delete registrations"
  ON pendaftaran
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_pendaftaran_status ON pendaftaran(status);
CREATE INDEX IF NOT EXISTS idx_pendaftaran_created_at ON pendaftaran(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pendaftaran_updated_at
  BEFORE UPDATE ON pendaftaran
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
