# Authentication Documentation

## JWT-Based Authentication

The Scoring App backend uses JWT (JSON Web Tokens) for secure user authentication with bcrypt password hashing.

## Features

✅ **User Registration** - Create new admin users
✅ **Login with Credentials** - Email and password authentication
✅ **JWT Tokens** - Access and Refresh tokens
✅ **Password Hashing** - Bcrypt with 10 salt rounds
✅ **Token Refresh** - Generate new access token from refresh token
✅ **Protected Routes** - Bearer token authentication middleware
✅ **User Profile** - Get current authenticated user

## Environment Setup

Add these to your `.env` file:

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=7d
```

## API Endpoints

### 1. Register User
**POST** `/api/auth/register`

Register a new user with admin role (default).

**Request:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123",
  "passwordConfirm": "password123"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    "active": true
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation:**
- Email must be unique
- Password must be at least 6 characters
- Password and passwordConfirm must match

---

### 2. Login User
**POST** `/api/auth/login`

Authenticate user with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Cases:**
- `401 Unauthorized` - Invalid email or password
- `401 Account Inactive` - User account is disabled

---

### 3. Refresh Access Token
**POST** `/api/auth/refresh`

Generate a new access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 4. Get Current User
**GET** `/api/auth/me`

Get the profile of the currently authenticated user.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "admin",
  "active": true,
  "createdAt": "2025-11-12T10:30:00Z",
  "updatedAt": "2025-11-12T10:30:00Z"
}
```

---

### 5. Logout
**POST** `/api/auth/logout`

Logout the current user (client should delete tokens).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "message": "Logout successful",
  "note": "Please delete the token on client side"
}
```

---

## Token Structure

### JWT Payload
```typescript
{
  userId: number;
  email: string;
  role: string;
  iat: number;        // Issued at
  exp: number;        // Expiration time
}
```

### Token Types

**Access Token**
- Expiry: 7 days (configurable via `JWT_EXPIRY`)
- Used for: API requests
- Included in: `Authorization: Bearer <token>`

**Refresh Token**
- Expiry: 30 days
- Used for: Requesting new access tokens
- Should be stored securely on client

---

## Using Protected Routes

### Client Implementation

**Step 1: Login and get tokens**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Step 2: Use access token in subsequent requests**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

**Step 3: When token expires, use refresh token**
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<refreshToken>"}'
```

---

## Authentication Middleware

The `authMiddleware` validates JWT tokens and attaches user info to the request:

```typescript
(req as any).userId      // User ID
(req as any).userEmail   // User Email
(req as any).userRole    // User Role
```

### Protected Route Example

```typescript
router.get('/protected', authMiddleware, (req, res) => {
  const userId = (req as any).userId;
  res.json({ message: `This is user ${userId}` });
});
```

---

## Password Security

### Hashing Algorithm
- **Algorithm:** Bcrypt
- **Salt Rounds:** 10
- **Async:** Yes (using bcryptjs)

### Password Requirements
- Minimum 6 characters (configurable)
- Should include mix of uppercase, lowercase, numbers, special chars (recommended)
- Always transmitted over HTTPS in production

---

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` to repository
   - Use strong `JWT_SECRET` (min 32 characters)
   - Rotate secrets periodically in production

2. **HTTPS**
   - Always use HTTPS in production
   - Never send tokens over HTTP

3. **Token Storage**
   - **Access Token:** Store in memory or short-lived HTTP-only cookie
   - **Refresh Token:** Store in secure HTTP-only cookie or secure storage
   - Never store in localStorage (XSS vulnerability)

4. **CORS**
   - Whitelist allowed origins
   - Don't use `*` in production

5. **Token Blacklist** (Optional)
   - For logout, implement token blacklist
   - Store revoked tokens in cache/Redis
   - Check blacklist before processing token

6. **Rate Limiting**
   - Implement rate limiting on auth endpoints
   - Prevent brute force attacks

7. **Input Validation**
   - Validate email format
   - Validate password strength
   - Sanitize inputs

---

## Error Responses

### 400 - Bad Request
```json
{
  "error": "email and password are required"
}
```

### 401 - Unauthorized
```json
{
  "error": "Invalid email or password"
}
```

### 409 - Conflict
```json
{
  "error": "Email already registered"
}
```

### 500 - Server Error
```json
{
  "error": "Failed to login"
}
```

---

## Example Frontend Implementation

### JavaScript/TypeScript
```typescript
class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  async login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    this.accessToken = data.tokens.accessToken;
    this.refreshToken = data.tokens.refreshToken;
    return data;
  }

  async getMe() {
    const response = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${this.accessToken}` },
    });
    return response.json();
  }

  async refreshAccessToken() {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });
    
    const data = await response.json();
    this.accessToken = data.accessToken;
    return data;
  }
}
```

---

## Troubleshooting

### "Invalid or expired token"
- Token has expired or is malformed
- Solution: Use refresh token to get new access token

### "Missing or invalid authorization header"
- Authorization header not sent or malformed
- Solution: Include `Authorization: Bearer <token>` header

### "Invalid email or password"
- Email not found or password incorrect
- Solution: Verify credentials and try again

### "Email already registered"
- Email is already in use
- Solution: Use login instead or register with different email
