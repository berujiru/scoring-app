import { Request, Response } from 'express';
import { prisma } from '@/index';

export const createCriteria = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, percentage, eventId } = req.body;

    if (!name || percentage === undefined || !eventId) {
      res.status(400).json({ error: 'name, percentage, and eventId are required' });
      return;
    }

    if (percentage < 0 || percentage > 100) {
      res.status(400).json({ error: 'percentage must be between 0 and 100' });
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

    const criteria = await prisma.criteria.create({
      data: {
        name,
        percentage: parseFloat(percentage),
        eventId: parseInt(eventId),
      },
    });

    res.status(201).json(criteria);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create criteria' });
  }
};

export const getCriteriaByEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;

    const criteria = await prisma.criteria.findMany({
      where: { eventId: parseInt(eventId) },
    });

    res.json(criteria);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch criteria' });
  }
};

export const getCriteriaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const criteria = await prisma.criteria.findUnique({
      where: { id: parseInt(id) },
    });

    if (!criteria) {
      res.status(404).json({ error: 'Criteria not found' });
      return;
    }

    res.json(criteria);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch criteria' });
  }
};

export const updateCriteria = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, percentage } = req.body;

    if (percentage !== undefined && (percentage < 0 || percentage > 100)) {
      res.status(400).json({ error: 'percentage must be between 0 and 100' });
      return;
    }

    const criteria = await prisma.criteria.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(percentage !== undefined && { percentage: parseFloat(percentage) }),
      },
    });

    res.json(criteria);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Criteria not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to update criteria' });
  }
};

export const deleteCriteria = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.criteria.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Criteria not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to delete criteria' });
  }
};
