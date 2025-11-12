import { Request, Response } from 'express';
import { prisma } from '@/index';

export const createContestant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, eventId } = req.body;

    if (!name || !eventId) {
      res.status(400).json({ error: 'name and eventId are required' });
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

    const contestant = await prisma.contestant.create({
      data: {
        name,
        eventId: parseInt(eventId),
      },
    });

    res.status(201).json(contestant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create contestant' });
  }
};

export const getContestantsByEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;

    const contestants = await prisma.contestant.findMany({
      where: { eventId: parseInt(eventId) },
    });

    res.json(contestants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contestants' });
  }
};

export const getContestantById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const contestant = await prisma.contestant.findUnique({
      where: { id: parseInt(id) },
    });

    if (!contestant) {
      res.status(404).json({ error: 'Contestant not found' });
      return;
    }

    res.json(contestant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contestant' });
  }
};

export const updateContestant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const contestant = await prisma.contestant.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
      },
    });

    res.json(contestant);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Contestant not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to update contestant' });
  }
};

export const deleteContestant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.contestant.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Contestant not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to delete contestant' });
  }
};
