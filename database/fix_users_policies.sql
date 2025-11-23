-- ============================================
-- FORCE FIX Users Table RLS Policies
-- ============================================
-- This script completely removes and recreates
-- the users table policies to fix infinite recursion

-- Step 1: Disable RLS temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies (force drop)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON users';
    END LOOP;
END $$;

-- Step 3: Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 4: Create ONLY the correct policies
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Step 5: Verify policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';
