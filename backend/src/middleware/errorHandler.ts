import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/services/authService';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(err);

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
    });
    return;
  }

  res.status(500).json({
    error: 'Internal Server Error',
    statusCode: 500,
  });
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const payload = verifyToken(token);

    if (!payload) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Attach user info to request
    (req as any).userId = payload.userId;
    (req as any).userEmail = payload.email;
    (req as any).userRole = payload.role;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

