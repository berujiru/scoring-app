import { Request, Response } from 'express';
import { prisma } from '@/index';

export const submitJudgingScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { score, eventId, contestantId, judgeId, criteriaId } = req.body;

    if (score === undefined || !eventId || !contestantId || !judgeId || !criteriaId) {
      res.status(400).json({
        error: 'score, eventId, contestantId, judgeId, and criteriaId are required',
      });
      return;
    }

    if (score < 0 || score > 100) {
      res.status(400).json({ error: 'score must be between 0 and 100' });
      return;
    }

    // Verify all entities exist and belong to the same event
    const [event, contestant, judge, criteria] = await Promise.all([
      prisma.event.findUnique({ where: { id: parseInt(eventId) } }),
      prisma.contestant.findUnique({ where: { id: parseInt(contestantId) } }),
      prisma.judge.findUnique({ where: { id: parseInt(judgeId) } }),
      prisma.criteria.findUnique({ where: { id: parseInt(criteriaId) } }),
    ]);

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (!contestant || contestant.eventId !== parseInt(eventId)) {
      res.status(404).json({ error: 'Contestant not found in this event' });
      return;
    }

    if (!judge || judge.eventId !== parseInt(eventId)) {
      res.status(404).json({ error: 'Judge not found in this event' });
      return;
    }

    if (!criteria || criteria.eventId !== parseInt(eventId)) {
      res.status(404).json({ error: 'Criteria not found in this event' });
      return;
    }

    // Check if score already exists, update or create
    const existingScore = await prisma.judgingRow.findFirst({
      where: {
        eventId: parseInt(eventId),
        contestantId: parseInt(contestantId),
        judgeId: parseInt(judgeId),
        criteriaId: parseInt(criteriaId),
      },
    });

    let judgingRow;
    if (existingScore) {
      judgingRow = await prisma.judgingRow.update({
        where: { id: existingScore.id },
        data: {
          score: parseFloat(score),
        },
      });
    } else {
      judgingRow = await prisma.judgingRow.create({
        data: {
          score: parseFloat(score),
          eventId: parseInt(eventId),
          contestantId: parseInt(contestantId),
          judgeId: parseInt(judgeId),
          criteriaId: parseInt(criteriaId),
        },
      });
    }

    res.status(existingScore ? 200 : 201).json(judgingRow);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit judging score' });
  }
};

export const getJudgingScoresByJudge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { judgeId } = req.params;

    const scores = await prisma.judgingRow.findMany({
      where: { judgeId: parseInt(judgeId) },
      include: {
        event: true,
        contestant: true,
        judge: true,
        criteria: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch judging scores' });
  }
};

export const getJudgingScoresByContestant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contestantId } = req.params;

    const scores = await prisma.judgingRow.findMany({
      where: { contestantId: parseInt(contestantId) },
      include: {
        event: true,
        contestant: true,
        judge: true,
        criteria: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch judging scores' });
  }
};

export const getJudgingScoresByEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;

    const scores = await prisma.judgingRow.findMany({
      where: { eventId: parseInt(eventId) },
      include: {
        contestant: true,
        judge: true,
        criteria: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch judging scores' });
  }
};

export const getJudgingScoresForContestantByJudge = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { eventId, judgeId, contestantId } = req.params;

    const scores = await prisma.judgingRow.findMany({
      where: {
        eventId: parseInt(eventId),
        judgeId: parseInt(judgeId),
        contestantId: parseInt(contestantId),
      },
      include: {
        criteria: true,
      },
    });

    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch judging scores' });
  }
};

export const deleteJudgingScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.judgingRow.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Judging score not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to delete judging score' });
  }
};
