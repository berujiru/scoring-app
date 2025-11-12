import { Router } from 'express';
import * as scoreController from '@/controllers/scoreController';

const router = Router();

/**
 * @swagger
 * /api/scores:
 *   get:
 *     summary: Get all scores
 *     tags: [Scores]
 *     responses:
 *       200:
 *         description: List of all scores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Score'
 */
router.get('/', scoreController.getAllScores);

/**
 * @swagger
 * /api/scores/{id}:
 *   get:
 *     summary: Get score by ID
 *     tags: [Scores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Score found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Score'
 *       404:
 *         description: Score not found
 */
router.get('/:id', scoreController.getScoreById);

/**
 * @swagger
 * /api/scores:
 *   post:
 *     summary: Create a new score
 *     tags: [Scores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               score:
 *                 type: number
 *               category:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Score created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Score'
 */
router.post('/', scoreController.createScore);

/**
 * @swagger
 * /api/scores/{id}:
 *   put:
 *     summary: Update score
 *     tags: [Scores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score:
 *                 type: number
 *               category:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Score updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Score'
 */
router.put('/:id', scoreController.updateScore);

/**
 * @swagger
 * /api/scores/{id}:
 *   delete:
 *     summary: Delete score
 *     tags: [Scores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Score deleted
 */
router.delete('/:id', scoreController.deleteScore);

/**
 * @swagger
 * /api/scores/user/{userId}:
 *   get:
 *     summary: Get scores by user ID
 *     tags: [Scores]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Scores for user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Score'
 */
router.get('/user/:userId', scoreController.getScoresByUserId);

export default router;
