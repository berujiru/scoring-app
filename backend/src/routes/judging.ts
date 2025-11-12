import { Router } from 'express';
import * as judgingController from '@/controllers/judgingController';
import { authMiddleware } from '@/middleware/errorHandler';

const router = Router();

/**
 * @swagger
 * /api/judging/judge/{judgeId}:
 *   get:
 *     summary: Get all judging scores by judge
 *     tags: [Judging]
 *     parameters:
 *       - in: path
 *         name: judgeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of judging scores
 */
router.get('/judge/:judgeId', authMiddleware, judgingController.getJudgingScoresByJudge);

/**
 * @swagger
 * /api/judging/contestant/{contestantId}:
 *   get:
 *     summary: Get all judging scores for a contestant
 *     tags: [Judging]
 *     parameters:
 *       - in: path
 *         name: contestantId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of judging scores
 */
router.get('/contestant/:contestantId', authMiddleware, judgingController.getJudgingScoresByContestant);

/**
 * @swagger
 * /api/judging/event/{eventId}:
 *   get:
 *     summary: Get all judging scores for an event
 *     tags: [Judging]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of judging scores
 */
router.get('/event/:eventId', authMiddleware, judgingController.getJudgingScoresByEvent);

/**
 * @swagger
 * /api/judging/event/{eventId}/tally:
 *   get:
 *     summary: Get tally (weighted totals) of judging results for an event
 *     tags: [Judging]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tally per contestant with criteria breakdown
 */
router.get('/event/:eventId/tally', judgingController.getJudgingTallyByEvent);

/**
 * @swagger
 * /api/judging/event/{eventId}/judge/{judgeId}/contestant/{contestantId}:
 *   get:
 *     summary: Get judging scores for contestant by specific judge
 *     tags: [Judging]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: judgeId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: contestantId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of judging scores
 */
router.get('/event/:eventId/judge/:judgeId/contestant/:contestantId', authMiddleware, judgingController.getJudgingScoresForContestantByJudge);

/**
 * @swagger
 * /api/judging:
 *   post:
 *     summary: Submit judging score for a criterion
 *     tags: [Judging]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score:
 *                 type: number
 *                 description: Score (0-100)
 *               eventId:
 *                 type: integer
 *               contestantId:
 *                 type: integer
 *               judgeId:
 *                 type: integer
 *               criteriaId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Judging score submitted
 */
// Allow submitting judging scores without authentication when the judge is identified by a valid code
// Public submission by judge code
router.post('/by-code', judgingController.submitJudgingScoreByCode);

// Keep original protected endpoint for authenticated flows
router.post('/', authMiddleware, judgingController.submitJudgingScore);

/**
 * @swagger
 * /api/judging/{id}:
 *   delete:
 *     summary: Delete judging score
 *     tags: [Judging]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Judging score deleted
 */
router.delete('/:id', authMiddleware, judgingController.deleteJudgingScore);

router.get('/event/:eventId/tally', authMiddleware, judgingController.getJudgingTallyByEvent);

export default router;
