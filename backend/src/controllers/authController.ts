import { Request, Response } from 'express';
import { prisma } from '@/index';
import {
  hashPassword,
  comparePassword,
  generateTokens,
  verifyToken,
  TokenPayload,
} from '@/services/authService';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, password, passwordConfirm } = req.body;

    if (!email || !name || !password || !passwordConfirm) {
      res
        .status(400)
        .json({
          error: 'email, name, password, and passwordConfirm are required',
        });
      return;
    }

    if (password !== passwordConfirm) {
      res.status(400).json({ error: 'Passwords do not match' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'admin',
        active: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
      },
    });

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const { accessToken, refreshToken } = generateTokens(tokenPayload);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    if (!user.active) {
      res.status(401).json({ error: 'Account is inactive' });
      return;
    }

    // Compare passwords
    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const { accessToken, refreshToken } = generateTokens(tokenPayload);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login' });
  }
};

export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'refreshToken is required' });
      return;
    }

    // Verify refresh token
    const payload = verifyToken(refreshToken);

    if (!payload) {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.active) {
      res.status(401).json({ error: 'User not found or inactive' });
      return;
    }

    // Generate new access token
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const newAccessToken = generateTokens(tokenPayload).accessToken;

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh token' });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch current user' });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  // JWT is stateless, so logout is mainly client-side
  // In production, you might want to implement a token blacklist
  res.json({
    message: 'Logout successful',
    note: 'Please delete the token on client side',
  });
};
