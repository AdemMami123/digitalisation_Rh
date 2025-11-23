# Authentication API Testing Guide

This guide provides step-by-step instructions for testing all authentication endpoints.

## Prerequisites

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   Server should be running on `http://localhost:5000`

2. **Set up Supabase database:**
   - Create the `users` table (see API_DOCUMENTATION.md for SQL schema)
   - Enable email authentication in Supabase dashboard

3. **Choose a testing tool:**
   - Postman (recommended)
   - Thunder Client (VS Code extension)
   - cURL (command line)
   - HTTPie (command line)

---

## Testing with Postman / Thunder Client

### 1. Test User Registration

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/register`
- Headers:
  ```
  Content-Type: application/json
  ```
- Body (JSON):
  ```json
  {
    "email": "john.doe@company.com",
    "password": "securepass123",
    "full_name": "John Doe",
    "role": "USER"
  }
  ```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for verification.",
  "user": {
    "id": "some-uuid",
    "email": "john.doe@company.com",
    "role": "USER",
    "full_name": "John Doe"
  }
}
```

**Test Case 2 - Register RH Admin:**
```json
{
  "email": "admin@company.com",
  "password": "adminpass123",
  "full_name": "Admin User",
  "role": "RH"
}
```

---

### 2. Test User Login

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/login`
- Headers:
  ```
  Content-Type: application/json
  ```
- Body (JSON):
  ```json
  {
    "email": "john.doe@company.com",
    "password": "securepass123"
  }
  ```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "user": {
    "id": "some-uuid",
    "email": "john.doe@company.com",
    "role": "USER",
    "full_name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Important:** 
- Check that a cookie named `access_token` is set in the response
- Copy the token value for manual testing if needed

---

### 3. Test Get Current User (Protected Route)

**Request:**
- Method: `GET`
- URL: `http://localhost:5000/api/auth/me`
- Headers: None needed (cookie is sent automatically)

**Expected Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "some-uuid",
    "email": "john.doe@company.com",
    "role": "USER",
    "full_name": "John Doe",
    "created_at": "2025-11-23T..."
  }
}
```

**Test Case - Without Cookie:**
- Clear cookies in Postman/Thunder Client
- Send request again
- Should get 401 Unauthorized

---

### 4. Test Forgot Password

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/forgot-password`
- Headers:
  ```
  Content-Type: application/json
  ```
- Body (JSON):
  ```json
  {
    "email": "john.doe@company.com"
  }
  ```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

**Verification:**
- Check the email inbox for the reset link
- Link should redirect to `http://localhost:3000/reset-password`

---

### 5. Test Token Refresh

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/refresh`
- Headers: None needed (uses existing cookie)

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully.",
  "token": "new-jwt-token..."
}
```

**Verification:**
- Cookie `access_token` should be updated with new token

---

### 6. Test Logout

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/logout`
- Headers: None

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Logout successful."
}
```

**Verification:**
- Cookie `access_token` should be cleared
- Subsequent calls to `/api/auth/me` should return 401

---

## Testing with cURL

### 1. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@company.com",
    "password": "password123",
    "full_name": "Test User",
    "role": "USER"
  }'
```

### 2. Login (Save Cookies)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@company.com",
    "password": "password123"
  }'
```

### 3. Get Current User (Use Saved Cookies)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -b cookies.txt
```

### 4. Logout (Use Saved Cookies)
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -b cookies.txt
```

---

## Testing with HTTPie

### 1. Register User
```bash
http POST http://localhost:5000/api/auth/register \
  email=test@company.com \
  password=password123 \
  full_name="Test User" \
  role=USER
```

### 2. Login (Save Session)
```bash
http --session=user POST http://localhost:5000/api/auth/login \
  email=test@company.com \
  password=password123
```

### 3. Get Current User (Use Session)
```bash
http --session=user GET http://localhost:5000/api/auth/me
```

### 4. Logout (Use Session)
```bash
http --session=user POST http://localhost:5000/api/auth/logout
```

---

## Complete Authentication Flow Test

Follow these steps to test the complete flow:

### Step 1: Register a Regular User
```json
POST /api/auth/register
{
  "email": "employee@company.com",
  "password": "employee123",
  "full_name": "Employee User",
  "role": "USER"
}
```

### Step 2: Register an RH Admin
```json
POST /api/auth/register
{
  "email": "hr@company.com",
  "password": "hradmin123",
  "full_name": "HR Admin",
  "role": "RH"
}
```

### Step 3: Login as Regular User
```json
POST /api/auth/login
{
  "email": "employee@company.com",
  "password": "employee123"
}
```
✅ Should receive token and cookie

### Step 4: Access Protected Route
```
GET /api/auth/me
```
✅ Should return user data

### Step 5: Test Token Refresh
```
POST /api/auth/refresh
```
✅ Should receive new token

### Step 6: Logout
```
POST /api/auth/logout
```
✅ Cookie should be cleared

### Step 7: Verify Logout
```
GET /api/auth/me
```
❌ Should return 401 Unauthorized

---

## Testing Role-Based Access Control

To test role-based middleware, create a test route:

**Add to `backend/src/index.ts`:**
```typescript
import { authenticate, requireRH } from './middleware/auth.middleware';

// Test RH-only route
app.get('/api/admin/test', authenticate, requireRH, (req, res) => {
  res.json({ 
    success: true, 
    message: 'RH access granted',
    user: req.user 
  });
});

// Test user route (both RH and USER allowed)
app.get('/api/user/test', authenticate, (req, res) => {
  res.json({ 
    success: true, 
    message: 'User access granted',
    user: req.user 
  });
});
```

**Test Scenarios:**

1. **Login as USER → Access `/api/admin/test`**
   - Expected: 403 Forbidden

2. **Login as RH → Access `/api/admin/test`**
   - Expected: 200 Success

3. **Login as USER → Access `/api/user/test`**
   - Expected: 200 Success

4. **Login as RH → Access `/api/user/test`**
   - Expected: 200 Success

---

## Error Testing

### Test Invalid Email Format
```json
POST /api/auth/register
{
  "email": "invalid-email",
  "password": "password123"
}
```
Expected: 400 Bad Request

### Test Short Password
```json
POST /api/auth/register
{
  "email": "test@company.com",
  "password": "123"
}
```
Expected: 400 Bad Request (minimum 6 characters)

### Test Wrong Password
```json
POST /api/auth/login
{
  "email": "employee@company.com",
  "password": "wrongpassword"
}
```
Expected: 401 Unauthorized

### Test Non-existent User
```json
POST /api/auth/login
{
  "email": "doesnotexist@company.com",
  "password": "anypassword"
}
```
Expected: 401 Unauthorized

### Test Expired/Invalid Token
- Manually modify the cookie value
- Access `/api/auth/me`
- Expected: 401 Unauthorized

---

## Postman Collection

Import this JSON into Postman for quick testing:

```json
{
  "info": {
    "name": "HR Platform Auth API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Register User",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"user@company.com\",\n  \"password\": \"password123\",\n  \"full_name\": \"Test User\",\n  \"role\": \"USER\"\n}"
        },
        "url": {"raw": "http://localhost:5000/api/auth/register"}
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"user@company.com\",\n  \"password\": \"password123\"\n}"
        },
        "url": {"raw": "http://localhost:5000/api/auth/login"}
      }
    },
    {
      "name": "Get Current User",
      "request": {
        "method": "GET",
        "url": {"raw": "http://localhost:5000/api/auth/me"}
      }
    },
    {
      "name": "Logout",
      "request": {
        "method": "POST",
        "url": {"raw": "http://localhost:5000/api/auth/logout"}
      }
    }
  ]
}
```

---

## Checklist

✅ Server is running on port 5000  
✅ Supabase is configured correctly  
✅ Users table exists in database  
✅ Can register new users  
✅ Can login with correct credentials  
✅ Login fails with wrong credentials  
✅ Cookie is set after login  
✅ Protected routes work with cookie  
✅ Protected routes reject without cookie  
✅ RH role can access admin routes  
✅ USER role cannot access admin routes  
✅ Logout clears cookie  
✅ Token refresh works  
✅ Forgot password sends email  

---

## Troubleshooting

### Issue: "Missing Supabase environment variables"
- Check `.env` file exists in `backend/` folder
- Verify all Supabase credentials are set

### Issue: "Invalid or expired token"
- Clear cookies and login again
- Check JWT_SECRET is set in `.env`

### Issue: "CORS error"
- Verify FRONTEND_URL in `.env` matches your frontend URL
- Check CORS configuration in `src/index.ts`

### Issue: "User not found in database"
- Check if `users` table exists in Supabase
- Verify RLS policies allow inserts
- Check backend logs for errors

### Issue: Cookie not being set
- Ensure you're using the same domain/port
- Check browser cookie settings
- Verify `credentials: true` in CORS config

---

## Next Steps

After confirming all tests pass:

1. ✅ Authentication system is working
2. ✅ Ready to build protected routes
3. ✅ Ready to implement frontend authentication
4. ✅ Ready to add training management features
5. ✅ Ready to add document management features
