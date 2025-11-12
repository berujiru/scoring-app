# Scoring App Backend - Updated Documentation

## Schema Overview

The backend has been updated to support a complete event scoring system with the following data model:

### Database Models

#### 1. **User** 
- Default role: `admin`
- All users are created as admins
- Can create multiple events
- Can be assigned as judges

**Fields:**
- `id` (Int, primary key)
- `email` (String, unique)
- `name` (String)
- `password` (String) - should be hashed in production
- `role` (String, default: "admin")
- `active` (Boolean, default: true)
- `createdAt`, `updatedAt` (DateTime)

#### 2. **Event**
- Created by users (admins)
- Contains contestants, judges, and criteria
- Has a unique route based on event ID

**Fields:**
- `id` (Int, primary key)
- `name` (String)
- `description` (String, optional)
- `userId` (Int, foreign key)
- `active` (Boolean, default: true)
- `createdAt`, `updatedAt` (DateTime)

#### 3. **Contestant**
- Belongs to a specific event
- Has a name
- Can be rated by multiple judges on multiple criteria

**Fields:**
- `id` (Int, primary key)
- `name` (String)
- `eventId` (Int, foreign key)
- `createdAt`, `updatedAt` (DateTime)

#### 4. **Judge**
- Created per event
- Has a **unique code** for routing and identification
- Each judge can rate contestants on criteria

**Fields:**
- `id` (Int, primary key)
- `name` (String)
- `userId` (Int, foreign key)
- `eventId` (Int, foreign key)
- `code` (String, unique) - Format: `JUDGE-{eventId}-{timestamp}-{uuid}`
- `createdAt`, `updatedAt` (DateTime)

#### 5. **Criteria**
- Defined per event
- Has a percentage weight out of 100
- Used to score contestants

**Fields:**
- `id` (Int, primary key)
- `name` (String)
- `percentage` (Float, 0-100)
- `eventId` (Int, foreign key)
- `createdAt`, `updatedAt` (DateTime)

#### 6. **JudgingRow**
- Links judge scores to contestants on specific criteria
- One record per judge-contestant-criteria combination per event
- Stores the actual score

**Fields:**
- `id` (Int, primary key)
- `score` (Float, 0-100)
- `eventId` (Int, foreign key)
- `contestantId` (Int, foreign key)
- `judgeId` (Int, foreign key)
- `criteriaId` (Int, foreign key)
- `createdAt`, `updatedAt` (DateTime)

## API Endpoints

### Users (`/api/users`)
```
GET    /api/users              - Get all users
GET    /api/users/:id          - Get user by ID
POST   /api/users              - Create new user (role: admin by default)
PUT    /api/users/:id          - Update user
DELETE /api/users/:id          - Delete user
```

### Events (`/api/events`)
```
GET    /api/events             - Get all events with contestants, judges, criteria
GET    /api/events/:id         - Get event by ID
POST   /api/events             - Create new event
PUT    /api/events/:id         - Update event
DELETE /api/events/:id         - Delete event (cascades to related data)
```

### Contestants (`/api/contestants`)
```
GET    /api/contestants/event/:eventId    - Get all contestants in an event
GET    /api/contestants/:id               - Get contestant by ID
POST   /api/contestants                   - Create new contestant
PUT    /api/contestants/:id               - Update contestant
DELETE /api/contestants/:id               - Delete contestant
```

### Judges (`/api/judges`)
```
GET    /api/judges/event/:eventId         - Get all judges in an event
GET    /api/judges/:id                    - Get judge by ID
GET    /api/judges/code/:code             - Get judge by unique code (includes event & contestants)
POST   /api/judges                        - Create new judge (auto-generates unique code)
PUT    /api/judges/:id                    - Update judge
DELETE /api/judges/:id                    - Delete judge
```

### Criteria (`/api/criteria`)
```
GET    /api/criteria/event/:eventId       - Get all criteria for an event
GET    /api/criteria/:id                  - Get criteria by ID
POST   /api/criteria                      - Create new criteria (percentage 0-100)
PUT    /api/criteria/:id                  - Update criteria
DELETE /api/criteria/:id                  - Delete criteria
```

### Judging (`/api/judging`)
```
GET    /api/judging/judge/:judgeId                                      - Get all scores by judge
GET    /api/judging/contestant/:contestantId                            - Get all scores for contestant
GET    /api/judging/event/:eventId                                      - Get all scores in event
GET    /api/judging/event/:eventId/judge/:judgeId/contestant/:contestantId  - Get scores for specific judge-contestant pair
POST   /api/judging                                                     - Submit judging score
DELETE /api/judging/:id                                                 - Delete judging score
```

## Workflow Example

### 1. Create Event
```bash
POST /api/events
{
  "name": "Science Fair 2024",
  "description": "Annual science competition",
  "userId": 1
}
```

### 2. Create Contestants
```bash
POST /api/contestants
{
  "name": "John Smith",
  "eventId": 1
}

POST /api/contestants
{
  "name": "Jane Doe",
  "eventId": 1
}
```

### 3. Create Judges (with unique codes)
```bash
POST /api/judges
{
  "name": "Dr. Johnson",
  "userId": 1,
  "eventId": 1
}
// Returns: { id: 1, code: "JUDGE-1-1731416000000-A7X3B9K2", ... }

POST /api/judges
{
  "name": "Prof. Williams",
  "userId": 2,
  "eventId": 1
}
// Returns: { id: 2, code: "JUDGE-1-1731416045000-M4L8P2N6", ... }
```

### 4. Create Judging Criteria
```bash
POST /api/criteria
{
  "name": "Presentation",
  "percentage": 40,
  "eventId": 1
}

POST /api/criteria
{
  "name": "Scientific Method",
  "percentage": 35,
  "eventId": 1
}

POST /api/criteria
{
  "name": "Innovation",
  "percentage": 25,
  "eventId": 1
}
```

### 5. Judge Access via Unique Code
```bash
GET /api/judges/code/JUDGE-1-1731416000000-A7X3B9K2
// Returns judge info with event details and contestants
```

### 6. Submit Judging Scores
```bash
POST /api/judging
{
  "score": 85,
  "eventId": 1,
  "contestantId": 1,
  "judgeId": 1,
  "criteriaId": 1
}
```

### 7. Retrieve Results
```bash
# Get all scores for a contestant
GET /api/judging/contestant/1

# Get all scores from a judge
GET /api/judging/judge/1

# Get scores for specific judge-contestant pair
GET /api/judging/event/1/judge/1/contestant/1
```

## Key Features

✅ **Simple User Model** - All users are admins by default
✅ **Event-Based Organization** - All data organized around events
✅ **Unique Judge Codes** - Each judge gets a unique route code for judging
✅ **Flexible Criteria** - Criteria percentages can sum to any value
✅ **Score Validation** - Scores must be between 0-100
✅ **Cascading Deletes** - Deleting an event removes all related data
✅ **Upsert Scoring** - Submitting same judge-contestant-criteria score updates if exists

## Database Setup

Run migrations:
```bash
npm run prisma:migrate
```

View data in Prisma Studio:
```bash
npm run prisma:studio
```

## Running the Server

Development:
```bash
npm run dev
```

Production:
```bash
npm run build
npm start
```

## API Documentation

Swagger UI is available at: `http://localhost:3000/api-docs`

## Security Notes

- Hash passwords before storing (use bcrypt)
- Add authentication middleware for protected routes
- Implement authorization checks (only admins/event creators can modify)
- Add input validation for all endpoints
- Consider rate limiting for production
- Use HTTPS in production
