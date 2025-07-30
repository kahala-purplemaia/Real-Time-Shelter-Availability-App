/*
  # Create shelters table for bed availability tracking

  1. New Tables
    - `shelters`
      - `id` (uuid, primary key)
      - `name` (text) - shelter name
      - `total_beds` (integer) - total bed capacity
      - `available_beds` (integer) - currently available beds
      - `allows_pets` (boolean) - whether pets are allowed
      - `requires_sobriety` (boolean) - whether sobriety is required
      - `accepts_families` (boolean) - whether families with children are accepted
      - `contact_phone` (text) - contact phone number
      - `contact_email` (text) - contact email address
      - `address` (text) - shelter address
      - `latitude` (decimal) - GPS latitude
      - `longitude` (decimal) - GPS longitude
      - `last_updated` (timestamptz) - when information was last updated
      - `updated_by` (text) - who updated the information
      - `created_at` (timestamptz) - record creation timestamp

  2. Security
    - Enable RLS on `shelters` table
    - Add policy for public read access
    - Add policy for authenticated users to update shelters

  3. Sample Data
    - Insert 6 sample shelters with realistic data
*/

CREATE TABLE IF NOT EXISTS shelters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  total_beds integer NOT NULL DEFAULT 0,
  available_beds integer NOT NULL DEFAULT 0,
  allows_pets boolean DEFAULT false,
  requires_sobriety boolean DEFAULT false,
  accepts_families boolean DEFAULT false,
  contact_phone text NOT NULL,
  contact_email text NOT NULL,
  address text NOT NULL,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  last_updated timestamptz DEFAULT now(),
  updated_by text DEFAULT 'System',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;

-- Allow public read access to shelter information
CREATE POLICY "Public can view shelters"
  ON shelters
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to update shelter information
CREATE POLICY "Authenticated users can update shelters"
  ON shelters
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert sample shelter data
INSERT INTO shelters (name, total_beds, available_beds, allows_pets, requires_sobriety, accepts_families, contact_phone, contact_email, address, latitude, longitude, last_updated, updated_by) VALUES
  ('Downtown Community Shelter', 50, 12, true, false, true, '(555) 123-4567', 'info@downtownshelter.org', '123 Main St, Downtown', 40.7589, -73.9851, now(), 'Staff'),
  ('Safe Haven Family Center', 30, 8, false, false, true, '(555) 234-5678', 'contact@safehavenfamily.org', '456 Oak Ave, Midtown', 40.7505, -73.9934, now(), 'Staff'),
  ('Hope Recovery House', 25, 3, false, true, false, '(555) 345-6789', 'admin@hoperecovery.org', '789 Pine St, East Side', 40.7282, -73.9942, now(), 'Staff'),
  ('Unity Emergency Shelter', 40, 15, true, false, false, '(555) 456-7890', 'help@unityshelter.org', '321 Elm St, West End', 40.7361, -74.0014, now(), 'Staff'),
  ('Riverside Transitional Housing', 35, 22, false, false, true, '(555) 567-8901', 'services@riversidehousing.org', '654 River Rd, Riverside', 40.7411, -73.9897, now(), 'Staff'),
  ('Metropolitan Overnight Shelter', 60, 5, true, false, false, '(555) 678-9012', 'intake@metroshelter.org', '987 Broadway, Central', 40.7484, -73.9857, now(), 'Staff');