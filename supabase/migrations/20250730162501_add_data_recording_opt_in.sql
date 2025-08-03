/*
  # Add data recording opt-in field to shelters table

  1. Changes
    - Add `data_recording_enabled` (boolean, default true) to shelters table
    - This allows shelters to opt-out of having their data recorded/displayed

  2. Migration
    - Add column with default value of true (all existing shelters remain visible)
    - Update existing shelters to have data recording enabled by default
*/

-- Add data recording opt-in field to shelters table
ALTER TABLE shelters 
ADD COLUMN data_recording_enabled boolean DEFAULT true NOT NULL;

-- Update existing shelters to have data recording enabled by default
UPDATE shelters 
SET data_recording_enabled = true 
WHERE data_recording_enabled IS NULL;
