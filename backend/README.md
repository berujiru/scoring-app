# Scoring App Backend

A modern REST API backend built with Node.js, Express, TypeScript, Prisma, and MySQL.

## Features

- ✨ **Express.js** - Fast, unopinionated web framework
- 🔷 **TypeScript** - Type-safe JavaScript
- 🗄️ **Prisma** - Modern ORM for database operations
- 🛢️ **MySQL** - Relational database
- 📚 **Swagger/OpenAPI** - API documentation
- 🛡️ **Helmet** - Security middleware
- 🔀 **CORS** - Cross-Origin Resource Sharing support
- 📝 **ESLint & Prettier** - Code quality and formatting

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- MySQL >= 5.7

## Installation

1. Clone the repository:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file:

```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:

```env
DATABASE_URL="mysql://user:password@localhost:3306/scoring_db"
PORT=3000
NODE_ENV=development
API_VERSION=v1
API_TITLE=Scoring App API
```

## Database Setup

1. Create a MySQL database:

```bash
mysql -u root -p
CREATE DATABASE scoring_db;
EXIT;
```

2. Run Prisma migrations:

```bash
npm run prisma:migrate
```

3. (Optional) Open Prisma Studio to view data:

```bash
npm run prisma:studio
```

## Development

Start the development server:

```bash
npm run dev
```

The server will start at `http://localhost:3000`

API documentation available at `http://localhost:3000/api-docs`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## API Endpoints

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Scores

Note: This project uses `JudgingRow` as the canonical representation of judge-submitted scores.
The legacy `/api/scores` endpoints were removed. Use the `/api/judging` endpoints to submit and
query judging scores (per event, contestant, judge, and criteria).

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes with Swagger docs
│   ├── services/        # Business logic (optional)
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   └── index.ts         # Application entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── dist/                # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Database Schema

### Users Table

- `id` - Primary key (auto-increment)
- `email` - Unique email address
- `name` - User full name
- `password` - Hashed password
- `role` - User role (default: "user")
- `active` - Account status (default: true)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Scores Table

Scores are stored in the `JudgingRow` table which links events, contestants, judges and criteria.

## Example Requests

### Create User

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "password123"
  }'
```

### Create Score

```bash
curl -X POST http://localhost:3000/api/scores \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "score": 95.5,
    "category": "math",
    "notes": "Excellent performance"
  }'
```

## Security Notes

- Always hash passwords before storing (implement bcrypt)
- Use environment variables for sensitive data
- Add authentication/authorization middleware
- Validate and sanitize all inputs
- Use HTTPS in production
- Implement rate limiting
- Add CSRF protection

## Contributing

1. Create a feature branch
2. Commit your changes
3. Run linting and tests
4. Push to the branch
5. Create a Pull Request

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
