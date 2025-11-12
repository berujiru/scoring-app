import { Request, Response } from 'express';
import { prisma } from '@/index';

export const getAllScores = async (_req: Request, res: Response): Promise<void> => {
  try {
    const scores = await prisma.score.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
};

export const getScoreById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const score = await prisma.score.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!score) {
      res.status(404).json({ error: 'Score not found' });
      return;
    }

    res.json(score);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch score' });
  }
};

export const createScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, score, category, notes } = req.body;

    if (!userId || score === undefined || !category) {
      res
        .status(400)
        .json({ error: 'userId, score, and category are required' });
      return;
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const newScore = await prisma.score.create({
      data: {
        userId: parseInt(userId),
        score: parseFloat(score),
        category,
        notes,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(newScore);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create score' });
  }
};

export const updateScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { score, category, notes } = req.body;

    const updatedScore = await prisma.score.update({
      where: { id: parseInt(id) },
      data: {
        ...(score !== undefined && { score: parseFloat(score) }),
        ...(category && { category }),
        ...(notes && { notes }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(updatedScore);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Score not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to update score' });
  }
};

export const deleteScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.score.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Score not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to delete score' });
  }
};

export const getScoresByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const scores = await prisma.score.findMany({
      where: { userId: parseInt(userId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
};
