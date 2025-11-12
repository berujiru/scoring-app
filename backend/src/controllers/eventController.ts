import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getAllEvents = async (_req: Request, res: Response): Promise<void> => {
  try {
    const events = await prisma.event.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            contestants: true,
            judges: true,
            criteria: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        contestants: true,
        judges: true,
        criteria: true,
      },
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, userId, active } = req.body;

    if (!name || !userId) {
      res.status(400).json({ error: 'name and userId are required' });
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

    const event = await prisma.event.create({
      data: {
        name,
        description,
        userId: parseInt(userId),
        // Ensure newly created events are inactive by default unless explicitly provided
        active: active !== undefined ? Boolean(active) : false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        contestants: true,
        judges: true,
        criteria: true,
      },
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
};

export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, active } = req.body;

    const event = await prisma.event.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(active !== undefined && { active }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        contestants: true,
        judges: true,
        criteria: true,
      },
    });

    res.json(event);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to update event' });
  }
};

export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.event.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to delete event' });
  }
};
