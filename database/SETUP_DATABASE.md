# Database Setup Guide

## Problem Diagnosis

You're getting two critical errors:

1. **404 on `/api/auth/me`**: Backend route exists but may not be running
2. **Infinite recursion in RLS policies**: Your `users` table policies reference the table they're protecting

## Solution Steps

### Step 1: Fix Supabase Users Table

The infinite recursion error means your RLS policies are incorrectly written. Execute the SQL in this order:

1. **Open Supabase Dashboard** → Your Project → SQL Editor
2. **Copy the entire contents** of `database/users_table.sql`
3. **Paste and Run** in SQL Editor

**IMPORTANT**: This will recreate the users table with correct policies. If you have existing data you want to keep:
- Comment out the `DROP TABLE IF EXISTS users CASCADE;` line before running
- The script uses `CREATE TABLE IF NOT EXISTS` so it won't delete existing data

### Step 2: Verify Database Setup

Run these verification queries in Supabase SQL Editor:

```sql
-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'users';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- Check policies (should use auth.uid() directly, not subqueries)
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users';

-- Check triggers
SELECT trigger_name 
FROM information_schema.triggers 
WHERE event_object_table = 'users';
```

Expected results:
- ✅ Table exists: `users`
- ✅ RLS enabled: `true`
- ✅ 3 policies: SELECT, UPDATE, INSERT
- ✅ 2 triggers: `trigger_update_users_updated_at`, `on_auth_user_created`

### Step 3: Restart Backend Server

The backend needs to reconnect to the database:

```powershell
# In backend directory
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 5000
```

### Step 4: Restart Frontend

```powershell
# In frontend directory
cd frontend
npm run dev
```

### Step 5: Test Authentication Flow

1. Open browser console (F12)
2. Navigate to `http://localhost:3000`
3. Check console logs - you should see:
   ```
   [AuthContext] Checking authentication...
   [AuthContext] Auth response: { success: true, user: {...} }
   [AuthContext] User authenticated: your-email@example.com
   [AuthContext] Auth check completed
   ```

## Understanding the Infinite Recursion Fix

### ❌ WRONG (Causes Infinite Recursion)

```sql
-- This creates a circular dependency
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  USING (id IN (SELECT id FROM users WHERE id = auth.uid()));
  --                    ^^^^^ Queries same table = infinite loop
```

### ✅ CORRECT (No Recursion)

```sql
-- This uses auth.uid() directly
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  USING (auth.uid() = id);
  --    ^^^^^^^^^ Direct comparison, no subquery
```

## What the Fix Does

1. **Drops old policies** that had infinite recursion
2. **Creates correct policies** using `auth.uid()` directly
3. **Sets up automatic profile creation** when users register
4. **Adds performance indexes** on email and role
5. **Enables proper RLS** without circular dependencies

## Troubleshooting

### Still getting 404 on /api/auth/me?

Check backend is running:
```powershell
# Test the endpoint directly
curl http://localhost:5000/api/health
```

If backend isn't running, check for errors:
```powershell
cd backend
npm run dev
```

### Still getting infinite recursion?

1. Verify policies were updated:
   ```sql
   SELECT policyname, qual 
   FROM pg_policies 
   WHERE tablename = 'users';
   ```

2. The `qual` column should show `(auth.uid() = id)` NOT a subquery

3. If wrong, drop and recreate:
   ```sql
   DROP POLICY IF EXISTS "Users can view their own profile" ON users;
   -- Then run the correct CREATE POLICY from users_table.sql
   ```

### Users table doesn't exist?

Run the full `users_table.sql` script. It uses `CREATE TABLE IF NOT EXISTS` so it's safe.

## Next Steps

After database is fixed:

1. ✅ Test login/logout
2. ✅ Test /api/auth/me endpoint
3. ✅ Execute `database/formations_table.sql` to create formations table
4. ✅ Test formations CRUD operations
