# Quick Start Guide - Authentication

## Setup

### 1. Update `.env` file

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=7d
```

### 2. Start the server

```bash
npm run dev
```

Server runs on: `http://localhost:3000`
API Docs: `http://localhost:3000/api-docs`

---

## Testing Authentication

### Option 1: Using cURL

**Register a new user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "name": "Demo User",
    "password": "password123",
    "passwordConfirm": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "password123"
  }'
```

**Get current user (replace TOKEN with accessToken from login):**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

---

### Option 2: Using Postman

1. **Create User Request**
   - Method: POST
   - URL: `http://localhost:3000/api/auth/register`
   - Body (JSON):
   ```json
   {
     "email": "user@test.com",
     "name": "Test User",
     "password": "test123",
     "passwordConfirm": "test123"
   }
   ```

2. **Login Request**
   - Method: POST
   - URL: `http://localhost:3000/api/auth/login`
   - Body (JSON):
   ```json
   {
     "email": "user@test.com",
     "password": "test123"
   }
   ```

3. **Get Protected Route**
   - Method: GET
   - URL: `http://localhost:3000/api/auth/me`
   - Headers: 
     - Key: `Authorization`
     - Value: `Bearer <accessToken>`

---

## How It Works

### 1. Registration
```
User → Register → Hash Password → Create User → Generate Tokens → Return Tokens
```

### 2. Login
```
User → Login Credentials → Verify Email → Compare Passwords → Generate Tokens → Return Tokens
```

### 3. Protected Routes
```
Client → Send Request + Bearer Token → Verify Token → Extract User Info → Process Request
```

### 4. Token Refresh
```
Expired Token → Refresh Token → Verify Refresh Token → Generate New Access Token
```

---

## Token Details

### Access Token
- **Duration:** 7 days (configurable)
- **Use:** API requests
- **Format:** Bearer token in Authorization header

### Refresh Token
- **Duration:** 30 days (fixed)
- **Use:** Get new access token
- **Format:** POST body parameter

---

## File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── authController.ts      ← Login/Register logic
│   ├── services/
│   │   └── authService.ts         ← JWT & Password hashing
│   ├── middleware/
│   │   └── errorHandler.ts        ← Auth middleware
│   └── routes/
│       └── auth.ts                ← Auth endpoints
├── AUTH.md                         ← Detailed documentation
└── QUICK_START_AUTH.md            ← This file
```

---

## Integration with Other Routes

### Create Event (Protected)
To make other routes protected, add `authMiddleware`:

```typescript
router.post('/', authMiddleware, eventController.createEvent);
```

### Get User Info in Controller
```typescript
export const createEvent = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).userId;  // ← Extracted from token
  const userEmail = (req as any).userEmail;
  const userRole = (req as any).userRole;
  
  // Use userId to create event for this user
};
```

---

## Security Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Use HTTPS in production
- [ ] Set `NODE_ENV=production` in production
- [ ] Implement rate limiting for auth endpoints
- [ ] Add CORS whitelist for allowed domains
- [ ] Store refresh tokens in HTTP-only cookies
- [ ] Implement token blacklist for logout (optional)
- [ ] Add password strength validation
- [ ] Add email verification (optional)
- [ ] Add 2FA (optional)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "email already registered" | Use a different email or login |
| "Invalid email or password" | Check credentials and try again |
| "Invalid or expired token" | Use refresh token to get new access token |
| "Missing authorization header" | Add `Authorization: Bearer <token>` header |
| 500 errors | Check server logs for details |

---

## Common Workflows

### Complete Auth Flow

```
1. User opens app
   ↓
2. Register / Login
   ↓
3. Receive accessToken + refreshToken
   ↓
4. Store tokens securely (client-side)
   ↓
5. Use accessToken for API requests
   ↓
6. When accessToken expires (7 days)
   ↓
7. Use refreshToken to get new accessToken
   ↓
8. Continue API requests with new token
```

---

## Next Steps

1. **Protect All Routes:** Add `authMiddleware` to routes that need authentication
2. **Add Email Verification:** Verify email before allowing login
3. **Add 2FA:** Two-factor authentication for extra security
4. **Add Audit Logs:** Log all auth events
5. **Add Refresh Token Rotation:** Issue new refresh token with each access token
6. **Add Device Management:** Track devices and sessions

---

## Useful Commands

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# View database
npm run prisma:studio

# Run migrations
npm run prisma:migrate
```

---

## API Documentation

Visit Swagger UI at `http://localhost:3000/api-docs` for interactive API testing.

All auth endpoints are documented with request/response examples.
