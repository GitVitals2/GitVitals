-- ML Training Data View
-- Run this in your Supabase SQL Editor to create the training data view
-- 
-- This view extracts features from vital_readings and uses is_correct as the target.
-- Only includes rows where is_correct IS NOT NULL (labeled data).

CREATE OR REPLACE VIEW ml_training_data AS
SELECT
  vr.id,
  vr.student_id,
  vr.patient_id,
  vr.reading_number,
  
  -- Core vital sign features
  vr.blood_pressure_sys AS bp_systolic,
  vr.blood_pressure_dia AS bp_diastolic,
  vr.heart_rate,
  CAST(vr.temperature AS FLOAT) AS temperature,
  vr.respiratory_rate,
  vr.oxygen_saturation,
  
  -- Derived features
  (vr.blood_pressure_sys - vr.blood_pressure_dia) AS pulse_pressure,
  
  -- Optional features (handle nulls)
  0 AS pain_level,
  
  -- Target label (is_correct: FALSE = needs recheck/at_risk, TRUE = ok, NULL = unlabeled)
  -- Convert boolean to 0/1 integer for ML model (invert logic)
  CASE 
    WHEN vr.is_correct IS NULL THEN NULL
    WHEN vr.is_correct = FALSE THEN 1
    ELSE 0
  END AS at_risk,
  
  vr.submitted_at,
  vr.entered_by_role
  
FROM vital_readings vr
WHERE vr.is_correct IS NOT NULL  -- Only include labeled data
ORDER BY vr.submitted_at DESC;

-- Grant read access to authenticated users
GRANT SELECT ON ml_training_data TO authenticated;

-- Optional: Create index on is_correct for faster view queries
CREATE INDEX IF NOT EXISTS idx_vitalreading_is_correct 
ON vital_readings(is_correct) 
WHERE is_correct IS NOT NULL;
