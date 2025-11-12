import { Router } from 'express';
import * as judgeController from '@/controllers/judgeController';
import { authMiddleware } from '@/middleware/errorHandler';

const router = Router();

/**
 * @swagger
 * /api/judges/event/{eventId}:
 *   get:
 *     summary: Get all judges by event
 *     tags: [Judges]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of judges
 */
router.get('/event/:eventId', authMiddleware, judgeController.getJudgesByEvent);

/**
 * @swagger
 * /api/judges/code/{code}:
 *   get:
 *     summary: Get judge by unique code
 *     tags: [Judges]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Judge found with event and contestants
 */
router.get('/code/:code', authMiddleware, judgeController.getJudgeByCode);

/**
 * @swagger
 * /api/judges/{id}:
 *   get:
 *     summary: Get judge by ID
 *     tags: [Judges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Judge found
 */
router.get('/:id', authMiddleware, judgeController.getJudgeById);

/**
 * @swagger
 * /api/judges:
 *   post:
 *     summary: Create a new judge with unique code
 *     tags: [Judges]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               userId:
 *                 type: integer
 *               eventId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Judge created with unique code
 */
router.post('/', authMiddleware, judgeController.createJudge);

/**
 * @swagger
 * /api/judges/{id}:
 *   put:
 *     summary: Update judge
 *     tags: [Judges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Judge updated
 */
router.put('/:id', authMiddleware, judgeController.updateJudge);

/**
 * @swagger
 * /api/judges/{id}:
 *   delete:
 *     summary: Delete judge
 *     tags: [Judges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Judge deleted
 */
router.delete('/:id', authMiddleware, judgeController.deleteJudge);

export default router;
