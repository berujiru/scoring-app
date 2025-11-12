import { Router } from 'express';
import * as criteriaController from '@/controllers/criteriaController';

const router = Router();

/**
 * @swagger
 * /api/criteria/event/{eventId}:
 *   get:
 *     summary: Get all criteria for an event
 *     tags: [Criteria]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of criteria
 */
router.get('/event/:eventId', criteriaController.getCriteriaByEvent);

/**
 * @swagger
 * /api/criteria/{id}:
 *   get:
 *     summary: Get criteria by ID
 *     tags: [Criteria]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Criteria found
 */
router.get('/:id', criteriaController.getCriteriaById);

/**
 * @swagger
 * /api/criteria:
 *   post:
 *     summary: Create a new criteria (percentage out of 100)
 *     tags: [Criteria]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               percentage:
 *                 type: number
 *                 description: Percentage weight (0-100)
 *               eventId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Criteria created
 */
router.post('/', criteriaController.createCriteria);

/**
 * @swagger
 * /api/criteria/{id}:
 *   put:
 *     summary: Update criteria
 *     tags: [Criteria]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Criteria updated
 */
router.put('/:id', criteriaController.updateCriteria);

/**
 * @swagger
 * /api/criteria/{id}:
 *   delete:
 *     summary: Delete criteria
 *     tags: [Criteria]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Criteria deleted
 */
router.delete('/:id', criteriaController.deleteCriteria);

export default router;
