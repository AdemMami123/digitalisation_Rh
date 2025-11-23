# Authentication API Documentation

## Base URL
```
http://localhost:5000/api/auth
```

## Authentication Endpoints

### 1. Register New User
**Endpoint:** `POST /api/auth/register`  
**Access:** Public

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "role": "USER"  // Optional: "RH" or "USER" (default: "USER")
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for verification.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "USER",
    "full_name": "John Doe"
  }
}
```

**Error Responses:**
- `400`: Missing fields or invalid data
- `500`: Server error

---

### 2. Login
**Endpoint:** `POST /api/auth/login`  
**Access:** Public

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "USER",
    "full_name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Notes:**
- Sets HTTP-only cookie named `access_token`
- Cookie expires in 7 days
- Token also returned in response body for testing

**Error Responses:**
- `400`: Missing email or password
- `401`: Invalid credentials
- `500`: Server error

---

### 3. Logout
**Endpoint:** `POST /api/auth/logout`  
**Access:** Public

**Request Body:** None

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful."
}
```

**Notes:**
- Clears the `access_token` cookie
- Signs out from Supabase session

---

### 4. Forgot Password
**Endpoint:** `POST /api/auth/forgot-password`  
**Access:** Public

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

**Notes:**
- Always returns success to prevent email enumeration
- Sends reset email via Supabase
- Reset link redirects to: `http://localhost:3000/reset-password`

**Error Responses:**
- `400`: Missing email
- `500`: Server error

---

### 5. Get Current User
**Endpoint:** `GET /api/auth/me`  
**Access:** Private (requires authentication)

**Headers Required:**
- Cookie: `access_token` (automatically sent by browser)

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "USER",
    "full_name": "John Doe",
    "created_at": "2025-11-23T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `401`: Not authenticated or invalid token
- `404`: User not found
- `500`: Server error

---

### 6. Refresh Token
**Endpoint:** `POST /api/auth/refresh`  
**Access:** Public (requires existing token)

**Request Body:** None

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Notes:**
- Generates new token from existing cookie
- Updates `access_token` cookie

**Error Responses:**
- `401`: No token or invalid token
- `500`: Server error

---

## Authentication Middleware

### `authenticate`
Protects routes by verifying JWT token from cookies.

**Usage:**
```typescript
import { authenticate } from './middleware/auth.middleware';

router.get('/protected', authenticate, controller);
```

**Behavior:**
- Reads token from `access_token` cookie
- Verifies token with JWT_SECRET
- Attaches user data to `req.user`
- Returns 401 if no token or invalid token

---

### `requireRH`
Ensures user has RH (HR Admin) role.

**Usage:**
```typescript
import { authenticate, requireRH } from './middleware/auth.middleware';

router.post('/admin-only', authenticate, requireRH, controller);
```

**Behavior:**
- Must be used AFTER `authenticate` middleware
- Checks if `req.user.role === 'RH'`
- Returns 403 if user is not RH

---

### `requireUser`
Ensures user has USER or RH role (authenticated employees).

**Usage:**
```typescript
import { authenticate, requireUser } from './middleware/auth.middleware';

router.get('/employee-data', authenticate, requireUser, controller);
```

**Behavior:**
- Must be used AFTER `authenticate` middleware
- Allows both USER and RH roles
- Returns 403 if unauthorized

---

### `optionalAuth`
Attaches user to request if authenticated, but doesn't require it.

**Usage:**
```typescript
import { optionalAuth } from './middleware/auth.middleware';

router.get('/public-but-personalized', optionalAuth, controller);
```

**Behavior:**
- Tries to verify token if present
- Continues even if no token or invalid token
- Sets `req.user` if valid token exists

---

## User Roles

### RH (HR Admin)
- Full administrative access
- Can manage all training, documents, and users
- Can create, update, delete resources

### USER (Employee)
- Read-only access to assigned training
- Can view documents
- Can submit satisfaction surveys
- Cannot access admin features

---

## JWT Token Structure

**Payload:**
```typescript
{
  userId: string;    // Supabase user UUID
  email: string;     // User email
  role: "RH" | "USER"; // User role
  iat: number;       // Issued at timestamp
  exp: number;       // Expiration timestamp
}
```

**Token Expiration:** 7 days

---

## Cookie Configuration

**Cookie Name:** `access_token`

**Settings:**
- `httpOnly: true` - Prevents JavaScript access (XSS protection)
- `secure: true` - HTTPS only in production
- `sameSite: 'lax'` - CSRF protection
- `maxAge: 7 days` - Cookie expiration

---

## Error Response Format

All errors follow this structure:
```json
{
  "success": false,
  "message": "Error description here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created (registration)
- `400` - Bad request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `500` - Internal server error

---

## Security Features

✅ **Password Security**
- Handled by Supabase Auth
- Bcrypt hashing
- Minimum 6 characters

✅ **Token Security**
- JWT signed with HS256
- Stored in HTTP-only cookies
- 7-day expiration

✅ **CORS Protection**
- Configured for `http://localhost:3000`
- Credentials allowed

✅ **Role-Based Access Control**
- Middleware enforces role permissions
- RH and USER roles supported

✅ **Email Enumeration Prevention**
- Forgot password always returns success

---

## Database Requirements

### Users Table Schema (Supabase)

Create this table in your Supabase database:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('RH', 'USER')) DEFAULT 'USER',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
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
```

---

## Testing the API

See `TESTING.md` for detailed testing instructions with examples using:
- cURL
- Postman
- Thunder Client
- HTTPie
