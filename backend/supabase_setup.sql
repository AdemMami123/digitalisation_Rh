-- ============================================
-- HR Training Platform - Database Setup
-- ============================================

-- 1. Create Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('RH', 'USER')) DEFAULT 'USER',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- ============================================

-- Policy: Users can view their own data
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Policy: RH can view all users
CREATE POLICY "RH can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'RH'
    )
  );

-- Policy: RH can update all users
CREATE POLICY "RH can update all users"
  ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'RH'
    )
  );

-- Policy: Allow inserts during registration
CREATE POLICY "Enable insert for registration"
  ON users FOR INSERT
  WITH CHECK (true);

-- 4. Create Updated At Trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Create Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- Verification Queries
-- ============================================

-- Check if table was created
SELECT * FROM information_schema.tables WHERE table_name = 'users';

-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'users';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'users';

-- ============================================
-- Test Data (Optional - for development)
-- ============================================

-- Note: You should register users through the API
-- This is just for reference or manual testing

-- Example insert (after auth.users record exists):
-- INSERT INTO users (id, email, full_name, role)
-- VALUES (
--   'your-auth-user-uuid',
--   'admin@company.com',
--   'HR Administrator',
--   'RH'
-- );
