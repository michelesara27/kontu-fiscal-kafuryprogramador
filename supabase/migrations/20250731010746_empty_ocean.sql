/*
  # Create clients table

  1. New Tables
    - `clients`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key to companies)
      - `name` (text, required)
      - `email` (text, nullable)
      - `phone` (text, nullable)
      - `cnpj_cpf` (text, nullable)
      - `business_type` (text, nullable)
      - `street` (text, nullable)
      - `neighborhood` (text, nullable)
      - `zip_code` (text, nullable)
      - `city` (text, nullable)
      - `state` (text, nullable)
      - `notes` (text, nullable)
      - `is_active` (boolean, default true)
      - `created_by` (uuid, foreign key to user_profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `clients` table
    - Add policies for company members to manage their clients

  3. Indexes
    - Index on company_id for fast company queries
    - Index on name for client searches
    - Index on cnpj_cpf for document searches
    - Index on is_active for filtering active clients
*/

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  cnpj_cpf text,
  business_type text,
  street text,
  neighborhood text,
  zip_code text,
  city text,
  state text,
  notes text,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_client_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_cnpj_cpf ON clients(cnpj_cpf);
CREATE INDEX IF NOT EXISTS idx_clients_is_active ON clients(is_active);
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON clients(created_by);

-- RLS Policies
CREATE POLICY "Company members can manage their clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
