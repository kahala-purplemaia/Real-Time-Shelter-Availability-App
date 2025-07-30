/*
  # Create shelters table with sample data

  1. New Tables
    - `shelters`
      - `id` (uuid, primary key)
      - `name` (text, shelter name)
      - `total_beds` (integer, total capacity)
      - `available_beds` (integer, current availability)
      - `allows_pets` (boolean, pet policy)
      - `requires_sobriety` (boolean, sobriety requirement)
      - `accepts_families` (boolean, family policy)
      - `contact_phone` (text, phone number)
      - `contact_email` (text, email address)
      - `address` (text, physical address)
      - `latitude` (numeric, map coordinates)
      - `longitude` (numeric, map coordinates)
      - `last_updated` (timestamptz, update tracking)
      - `updated_by` (text, staff attribution)
      - `created_at` (timestamptz, creation time)

  2. Security
    - Enable RLS on `shelters` table
    - Add policy for public read access
    - Add policy for authenticated users to update

  3. Sample Data
    - Insert 6 sample shelters with realistic data
*/

-- Create the shelters table
CREATE TABLE IF NOT EXISTS shelters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  total_beds integer DEFAULT 0 NOT NULL,
  available_beds integer DEFAULT 0 NOT NULL,
  allows_pets boolean DEFAULT false,
  requires_sobriety boolean DEFAULT false,
  accepts_families boolean DEFAULT false,
  contact_phone text NOT NULL,
  contact_email text NOT NULL,
  address text NOT NULL,
  latitude numeric(10,8) NOT NULL,
  longitude numeric(11,8) NOT NULL,
  last_updated timestamptz DEFAULT now(),
  updated_by text DEFAULT 'System',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view shelters"
  ON shelters
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update shelters"
  ON shelters
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert sample shelter data
INSERT INTO shelters (name, total_beds, available_beds, allows_pets, requires_sobriety, accepts_families, contact_phone, contact_email, address, latitude, longitude) VALUES
('Downtown Emergency Shelter', 50, 12, true, false, true, '(555) 123-4567', 'intake@downtownshelter.org', '123 Main Street, Downtown', 40.7589, -73.9851),
('Family Haven Center', 30, 8, true, false, true, '(555) 234-5678', 'families@havencenter.org', '456 Oak Avenue, Midtown', 40.7505, -73.9934),
('Safe Harbor Shelter', 75, 23, false, true, false, '(555) 345-6789', 'admissions@safeharbor.org', '789 Pine Street, Uptown', 40.7831, -73.9712),
('Community Care House', 40, 15, true, false, true, '(555) 456-7890', 'help@communitycare.org', '321 Elm Drive, Westside', 40.7282, -74.0776),
('New Beginnings Shelter', 60, 0, false, true, false, '(555) 567-8901', 'support@newbeginnings.org', '654 Maple Lane, Eastside', 40.7505, -73.9442),
('Hope House Emergency', 35, 7, true, false, true, '(555) 678-9012', 'emergency@hopehouse.org', '987 Cedar Court, Southside', 40.7282, -73.9942);