# Authentication API Examples

## Complete Workflow Example

### Step 1: Register a New User

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "johndoe@example.com",
    "name": "John Doe",
    "password": "SecurePass123!",
    "passwordConfirm": "SecurePass123!"
  }'
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "johndoe@example.com",
    "name": "John Doe",
    "role": "admin",
    "active": true
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obmRvZUBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczMTQxNjAwMCwiZXhwIjoxNzMyMDIwODAwfQ.signature",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obmRvZUBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczMTQxNjAwMCwiZXhwIjoxNzM0MDk0ODAwfQ.signature"
  }
}
```

---

### Step 2: Login with Credentials

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "johndoe@example.com",
    "password": "SecurePass123!"
  }'
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "johndoe@example.com",
    "name": "John Doe",
    "role": "admin"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obmRvZUBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczMTQxNjA0MCwiZXhwIjoxNzMyMDIwODQwfQ.signature",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obmRvZUBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczMTQxNjA0MCwiZXhwIjoxNzM0MDk0ODQwfQ.signature"
  }
}
```

---

### Step 3: Get Current User Profile

**Request:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obmRvZUBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczMTQxNjA0MCwiZXhwIjoxNzMyMDIwODQwfQ.signature"
```

**Response (200):**
```json
{
  "id": 1,
  "email": "johndoe@example.com",
  "name": "John Doe",
  "role": "admin",
  "active": true,
  "createdAt": "2025-11-12T10:26:40.000Z",
  "updatedAt": "2025-11-12T10:26:40.000Z"
}
```

---

### Step 4: Refresh Access Token (When Expired)

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obmRvZUBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczMTQxNjA0MCwiZXhwIjoxNzM0MDk0ODQwfQ.signature"
  }'
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obmRvZUBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczMTQxNjEwMCwiZXhwIjoxNzMyMDIwOTAwfQ.signature"
}
```

---

### Step 5: Create Event (Protected Route)

**Request:**
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obmRvZUBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczMTQxNjEwMCwiZXhwIjoxNzMyMDIwOTAwfQ.signature" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Science Fair 2024",
    "description": "Annual science competition",
    "userId": 1
  }'
```

**Response (201):**
```json
{
  "id": 1,
  "name": "Science Fair 2024",
  "description": "Annual science competition",
  "userId": 1,
  "active": true,
  "createdAt": "2025-11-12T10:27:00.000Z",
  "updatedAt": "2025-11-12T10:27:00.000Z",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "johndoe@example.com"
  },
  "contestants": [],
  "judges": [],
  "criteria": []
}
```

---

### Step 6: Logout

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obmRvZUBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczMTQxNjEwMCwiZXhwIjoxNzMyMDIwOTAwfQ.signature"
```

**Response (200):**
```json
{
  "message": "Logout successful",
  "note": "Please delete the token on client side"
}
```

---

## Error Scenarios

### 1. Register with Duplicate Email

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "johndoe@example.com",
    "name": "Another John",
    "password": "Password123!",
    "passwordConfirm": "Password123!"
  }'
```

**Response (409):**
```json
{
  "error": "Email already registered"
}
```

---

### 2. Login with Wrong Password

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "johndoe@example.com",
    "password": "WrongPassword"
  }'
```

**Response (401):**
```json
{
  "error": "Invalid email or password"
}
```

---

### 3. Missing Authorization Header

**Request:**
```bash
curl -X GET http://localhost:3000/api/auth/me
```

**Response (401):**
```json
{
  "error": "Missing or invalid authorization header"
}
```

---

### 4. Expired Token

**Request:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer expired-token-here"
```

**Response (401):**
```json
{
  "error": "Invalid or expired token"
}
```

---

### 5. Register with Weak Password

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "weak@example.com",
    "name": "Weak User",
    "password": "123",
    "passwordConfirm": "123"
  }'
```

**Response (400):**
```json
{
  "error": "Password must be at least 6 characters"
}
```

---

### 6. Password Mismatch

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nomatch@example.com",
    "name": "No Match User",
    "password": "Password123!",
    "passwordConfirm": "DifferentPassword"
  }'
```

**Response (400):**
```json
{
  "error": "Passwords do not match"
}
```

---

## JavaScript/TypeScript Examples

### With Fetch API

```typescript
// Register
async function register(email: string, name: string, password: string) {
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      name,
      password,
      passwordConfirm: password,
    }),
  });
  return response.json();
}

// Login
async function login(email: string, password: string) {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
}

// Get Current User
async function getCurrentUser(accessToken: string) {
  const response = await fetch('http://localhost:3000/api/auth/me', {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  return response.json();
}

// Refresh Token
async function refreshToken(refreshToken: string) {
  const response = await fetch('http://localhost:3000/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  return response.json();
}

// Usage
(async () => {
  // Register
  const regData = await register('user@test.com', 'Test User', 'password123');
  console.log('Registered:', regData);

  // Login
  const loginData = await login('user@test.com', 'password123');
  const { accessToken, refreshToken } = loginData.tokens;
  console.log('Access Token:', accessToken);

  // Get current user
  const user = await getCurrentUser(accessToken);
  console.log('Current User:', user);

  // Refresh token
  const newTokens = await refreshToken(refreshToken);
  console.log('New Access Token:', newTokens.accessToken);
})();
```

---

### With Axios

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        const { data } = await api.post('/auth/refresh', { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        return api.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);

// Usage
async function userWorkflow() {
  // Register
  const regRes = await api.post('/auth/register', {
    email: 'user@test.com',
    name: 'Test User',
    password: 'password123',
    passwordConfirm: 'password123',
  });
  const { accessToken, refreshToken } = regRes.data.tokens;

  // Store tokens
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);

  // Get current user (with token auto-added by interceptor)
  const userRes = await api.get('/auth/me');
  console.log('Current User:', userRes.data);

  // Create event (with token auto-added)
  const eventRes = await api.post('/events', {
    name: 'Science Fair',
    userId: userRes.data.id,
  });
  console.log('Created Event:', eventRes.data);
}
```

---

## Postman Collection Import

Create a new Postman collection with these requests:

```json
{
  "info": {
    "name": "Scoring App Auth",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/auth/register",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"user@test.com\",\"name\":\"Test User\",\"password\":\"password123\",\"passwordConfirm\":\"password123\"}"
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/auth/login",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"user@test.com\",\"password\":\"password123\"}"
        }
      }
    },
    {
      "name": "Get Me",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/auth/me",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{accessToken}}"
          }
        ]
      }
    }
  ]
}
```

---

## Notes

- Replace `accessToken` and `refreshToken` values with actual tokens from responses
- Bearer tokens are typically stored in secure HTTP-only cookies
- Access tokens expire after 7 days
- Refresh tokens are valid for 30 days
- Always use HTTPS in production
- Never expose tokens in logs or URLs
