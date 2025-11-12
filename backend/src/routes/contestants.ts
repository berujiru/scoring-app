import { Router } from 'express';
import * as contestantController from '../controllers/contestantController';
import { authMiddleware } from '../middleware/errorHandler';

const router = Router();

/**
 * @swagger
 * /api/contestants/event/{eventId}:
 *   get:
 *     summary: Get all contestants by event
 *     tags: [Contestants]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of contestants
 */
router.get('/event/:eventId', authMiddleware, contestantController.getContestantsByEvent);

/**
 * @swagger
 * /api/contestants/{id}:
 *   get:
 *     summary: Get contestant by ID
 *     tags: [Contestants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Contestant found
 */
router.get('/:id', authMiddleware, contestantController.getContestantById);

/**
 * @swagger
 * /api/contestants:
 *   post:
 *     summary: Create a new contestant
 *     tags: [Contestants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               eventId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Contestant created
 */
router.post('/', authMiddleware, contestantController.createContestant);

/**
 * @swagger
 * /api/contestants/{id}:
 *   put:
 *     summary: Update contestant
 *     tags: [Contestants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Contestant updated
 */
router.put('/:id', authMiddleware, contestantController.updateContestant);

/**
 * @swagger
 * /api/contestants/{id}:
 *   delete:
 *     summary: Delete contestant
 *     tags: [Contestants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Contestant deleted
 */
router.delete('/:id', authMiddleware, contestantController.deleteContestant);

export default router;
