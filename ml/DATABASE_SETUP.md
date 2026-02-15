# Database Setup for GitVitals ML Component

## Overview
GitVitals uses Supabase (PostgreSQL) for storing vital signs data and a hybrid approach for machine learning training.

## Database Schema

### Tables
- **vital_readings**: Stores student-submitted vital sign measurements
- **students**: Student enrollment data
- **patients**: Patient case information
- **correct_vitals**: Reference values for validation

### ML Training View
Created view `ml_training_data` that:
- Extracts 8 features from vital_readings
- Uses `is_correct` field as target label (FALSE = at_risk, TRUE = normal)
- Only includes labeled records for training

## Training Data Strategy

### Current Implementation
- **Training**: Uses pre-generated 91k CSV dataset (`ml/data/training_data_91k_combined.csv`)
- **Prediction**: Uses live database queries via Supabase
- **Benefit**: Fast training, scalable production predictions

### Database Fields Mapping
```
CSV Column          → Database Column
------------------------------------------
bp_systolic         → blood_pressure_sys
bp_diastolic        → blood_pressure_dia
heart_rate          → heart_rate
temperature         → temperature
respiratory_rate    → respiratory_rate
oxygen_saturation   → oxygen_saturation
pulse_pressure      → (calculated: sys - dia)
pain_level          → (default: 0, not collected yet)
at_risk             → (derived from is_correct)
```

## Setup Steps Completed

1. ✅ Connected to Supabase database
2. ✅ Verified table schema matches application needs
3. ✅ Created `ml_training_data` view for future database-driven training
4. ✅ Configured environment variables in `.env.local`

## Future Enhancements
- Add `age_years` field to vital_readings table
- Add `pain_level` field for comprehensive assessment
- Migrate to database-driven training when sufficient labeled data available
- Implement real-time model retraining pipeline

## Connection Details
Database accessed via:
- Supabase client library (JavaScript/Node.js)
- Direct PostgreSQL connection string (Python ML scripts)
- Environment variables stored in `.env.local` (not committed to git)
