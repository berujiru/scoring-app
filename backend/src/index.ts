import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import eventRoutes from './routes/events';
import contestantRoutes from './routes/contestants';
import judgeRoutes from './routes/judges';
import criteriaRoutes from './routes/criteria';
import judgingRoutes from './routes/judging';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
// Basic security headers
app.use(helmet());

// CORS Configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
  credentials: true
};

app.use(cors(corsOptions));

// Log CORS configuration for debugging
console.log('CORS Configuration:', {
  origin: corsOptions.origin,
  methods: corsOptions.methods,
  allowedHeaders: corsOptions.allowedHeaders,
  credentials: corsOptions.credentials
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: process.env.API_TITLE || 'Scoring App API',
      version: process.env.API_VERSION || 'v1',
      description: 'API documentation for Scoring App Backend',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
      {
        url: 'https://api.example.com',
        description: 'Production server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string' },
            active: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check Route
app.get('/health', (_req: express.Request, res: express.Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    environment: NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/contestants', contestantRoutes);
app.use('/api/judges', judgeRoutes);
app.use('/api/criteria', criteriaRoutes);
app.use('/api/judging', judgingRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    path: req.path,
  });
});

// Error Handler
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
      status: err.status || 500,
    });
  }
);

// Start Server
const server = app.listen(PORT, () => {
  console.log(`✨ Server is running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🔧 Environment: ${NODE_ENV}`);
});

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await prisma.$disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await prisma.$disconnect();
    process.exit(0);
  });
});

export default app;
export { prisma };
