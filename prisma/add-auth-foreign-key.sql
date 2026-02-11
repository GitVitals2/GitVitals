-- Link public.users to auth.users with foreign key constraint
-- This ensures users.id matches auth.users.id for authenticated users

-- Step 1: Check if foreign key constraint already exists
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE table_name = 'users' 
  AND constraint_type = 'FOREIGN KEY'
  AND constraint_name LIKE '%auth%';

-- Step 2: Find and display orphaned users (in public.users but not in auth.users)
SELECT u.id, u.email, u.name, u.role
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE au.id IS NULL;

-- Step 2a: Delete dependent records first (vitals, patients, etc.)
-- This cleans up any data created by orphaned users
DELETE FROM public.vital_readings
WHERE entered_by_id IN (
  SELECT u.id FROM public.users u
  LEFT JOIN auth.users au ON u.id = au.id
  WHERE au.id IS NULL
);

DELETE FROM public.correct_vitals
WHERE created_by_id IN (
  SELECT u.id FROM public.users u
  LEFT JOIN auth.users au ON u.id = au.id
  WHERE au.id IS NULL
);

DELETE FROM public.patients
WHERE user_id IN (
  SELECT u.id FROM public.users u
  LEFT JOIN auth.users au ON u.id = au.id
  WHERE au.id IS NULL
)
OR student_id IN (
  SELECT s.id FROM public.students s
  WHERE s.user_id IN (
    SELECT u.id FROM public.users u
    LEFT JOIN auth.users au ON u.id = au.id
    WHERE au.id IS NULL
  )
);

DELETE FROM public.students
WHERE user_id IN (
  SELECT u.id FROM public.users u
  LEFT JOIN auth.users au ON u.id = au.id
  WHERE au.id IS NULL
);

-- Step 2b: Delete orphaned users (in public.users but not in auth.users)
DELETE FROM public.users
WHERE id IN (
  SELECT u.id
  FROM public.users u
  LEFT JOIN auth.users au ON u.id = au.id
  WHERE au.id IS NULL
);

-- Step 2c: Add foreign key constraint from public.users.id to auth.users.id
-- This constraint allows the relationship but doesn't require all users to be auth users
DO $$ 
BEGIN
  -- Check if constraint already exists to avoid error
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_id_fkey_auth' 
      AND table_name = 'users'
  ) THEN
    ALTER TABLE public.users
    ADD CONSTRAINT users_id_fkey_auth
    FOREIGN KEY (id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE 'Foreign key constraint added successfully';
  ELSE
    RAISE NOTICE 'Foreign key constraint already exists';
  END IF;
END $$;

-- Step 3: Verify the constraint was added
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'users';

-- Step 4: Create a trigger to automatically sync new auth users to public.users
-- This ensures every new signup creates a profile row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'STUDENT'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify trigger was created
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
