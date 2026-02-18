ALTER TABLE vital_readings
  ADD COLUMN IF NOT EXISTS graded_at timestamptz,
  ADD COLUMN IF NOT EXISTS instructor_feedback text;
