import { Request, Response } from 'express';
import { prisma } from '@/index';
import { v4 as uuidv4 } from 'uuid';

export const createJudge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, userId, eventId } = req.body;

    if (!name || !userId || !eventId) {
      res.status(400).json({ error: 'name, userId, and eventId are required' });
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

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    // Generate unique code for judge
    const code = `JUDGE-${eventId}-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    const judge = await prisma.judge.create({
      data: {
        name,
        userId: parseInt(userId),
        eventId: parseInt(eventId),
        code,
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

    res.status(201).json(judge);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create judge' });
  }
};

export const getJudgesByEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;

    const judges = await prisma.judge.findMany({
      where: { eventId: parseInt(eventId) },
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

    res.json(judges);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch judges' });
  }
};

export const getJudgeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const judge = await prisma.judge.findUnique({
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

    if (!judge) {
      res.status(404).json({ error: 'Judge not found' });
      return;
    }

    res.json(judge);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch judge' });
  }
};

export const getJudgeByCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const judge = await prisma.judge.findUnique({
      where: { code },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        event: {
          include: {
            contestants: true,
            criteria: true,
          },
        },
      },
    });

    if (!judge) {
      res.status(404).json({ error: 'Judge not found' });
      return;
    }

    res.json(judge);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch judge' });
  }
};

export const updateJudge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const judge = await prisma.judge.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
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

    res.json(judge);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Judge not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to update judge' });
  }
};

export const deleteJudge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.judge.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Judge not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to delete judge' });
  }
};
