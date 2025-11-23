-- ============================================
-- Users Table Setup for Supabase
-- ============================================
-- This table stores user profile information
-- and extends the auth.users table

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;

-- Drop existing table if it exists (BE CAREFUL - this deletes all data!)
-- Comment out the next line if you want to keep existing data
-- DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'RH')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies (NO RECURSION)
-- ============================================

-- Policy 1: Users can view their own profile
-- IMPORTANT: Use auth.uid() directly, NOT a subquery to users table
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
-- IMPORTANT: Use auth.uid() directly, NOT a subquery to users table
CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Allow insert during registration
-- IMPORTANT: Use auth.uid() directly, NOT a subquery to users table
CREATE POLICY "Enable insert for authenticated users only"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- Triggers
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON users;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

-- ============================================
-- Function to create user profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'USER')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Grant necessary permissions
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT SELECT ON users TO anon;

-- ============================================
-- Verification Queries
-- ============================================
-- Run these queries to verify the setup:

-- 1. Check if table exists
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users';

-- 2. Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users';

-- 3. Check policies (SHOULD NOT reference users table in USING/WITH CHECK)
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'users';

-- 4. Check triggers
-- SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'users';

-- ============================================
-- CRITICAL NOTES
-- ============================================
-- The infinite recursion error happens when RLS policies
-- try to query the same table they're protecting.
--
-- WRONG (causes infinite recursion):
-- USING (id IN (SELECT id FROM users WHERE id = auth.uid()))
--
-- CORRECT (no recursion):
-- USING (auth.uid() = id)
--
-- Always use auth.uid() directly in policies for the users table!
-- ============================================
