import { Router } from 'express';
import * as judgingController from '@/controllers/judgingController';

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
router.get('/judge/:judgeId', judgingController.getJudgingScoresByJudge);

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
router.get('/contestant/:contestantId', judgingController.getJudgingScoresByContestant);

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
router.get('/event/:eventId', judgingController.getJudgingScoresByEvent);

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
router.get('/event/:eventId/judge/:judgeId/contestant/:contestantId', judgingController.getJudgingScoresForContestantByJudge);

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
router.post('/', judgingController.submitJudgingScore);

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
router.delete('/:id', judgingController.deleteJudgingScore);

export default router;
