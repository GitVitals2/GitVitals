-- ML Training Data View
-- Run this in your Supabase SQL Editor to create the training data view
-- 
-- This view extracts features from VitalReading and uses instructorLabel as the target.
-- Only includes rows where instructorLabel IS NOT NULL (labeled data).

CREATE OR REPLACE VIEW ml_training_data AS
SELECT
  vr.id,
  vr."studentId",
  vr."patientId",
  vr."readingNumber",
  
  -- Core vital sign features (6 features)
  vr."bloodPressureSystolic" AS bp_systolic,
  vr."bloodPressureDiastolic" AS bp_diastolic,
  vr."heartRate" AS heart_rate,
  CAST(vr.temperature AS FLOAT) AS temperature,
  vr."respiratoryRate" AS respiratory_rate,
  vr."oxygenSaturation" AS oxygen_saturation,
  
  -- Derived features
  (vr."bloodPressureSystolic" - vr."bloodPressureDiastolic") AS pulse_pressure,
  
  -- Optional features (handle nulls)
  COALESCE(vr."pain0to10", 0) AS pain_level,
  
  -- Target label (instructorLabel: TRUE = needs recheck/at_risk, FALSE = ok, NULL = unlabeled)
  -- Convert boolean to 0/1 integer for ML model
  CASE 
    WHEN vr."instructorLabel" IS NULL THEN NULL
    WHEN vr."instructorLabel" = TRUE THEN 1
    ELSE 0
  END AS at_risk,
  
  vr."submittedAt",
  vr."gradedAt"
  
FROM "VitalReading" vr
WHERE vr."instructorLabel" IS NOT NULL  -- Only include labeled data
ORDER BY vr."submittedAt" DESC;

-- Grant read access to authenticated users
-- Adjust role name based on your Supabase RLS setup
GRANT SELECT ON ml_training_data TO authenticated;

-- Optional: Create index on instructorLabel for faster view queries
CREATE INDEX IF NOT EXISTS idx_vitalreading_instructor_label 
ON "VitalReading"("instructorLabel") 
WHERE "instructorLabel" IS NOT NULL;
