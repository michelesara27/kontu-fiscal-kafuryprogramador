/*
  # Create companies table

  1. New Tables
    - `companies`
      - `id` (uuid, primary key)
      - `fantasy_name` (text, required)
      - `cnpj` (text, unique, required)
      - `email` (text, required)
      - `phone` (text, required)
      - `street` (text, required)
      - `neighborhood` (text, required)
      - `zip_code` (text, required)
      - `city` (text, required)
      - `state` (text, required)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `companies` table
    - Add policies for authenticated users to read their own company data
    - Add policies for admins to update their company data

  3. Indexes
    - Index on `cnpj` for fast lookups
    - Index on `email` for fast lookups
*/

CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fantasy_name text NOT NULL,
  cnpj text UNIQUE NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  street text NOT NULL,
  neighborhood text NOT NULL,
  zip_code text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_cnpj ON companies(cnpj);
CREATE INDEX IF NOT EXISTS idx_companies_email ON companies(email);

-- RLS Policies
CREATE POLICY "Users can read their own company data"
  ON companies
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update their company data"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
