import { Router } from 'express';
import { getHealthCheck } from '../controllers/sample.controller.js';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Sistema
 *     summary: Health check del sistema
 *     description: Retorna el estado actual del servicio y de la conexión de la base de datos.
 *     responses:
 *       200:
 *         description: El servidor está saludable.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *       500:
 *         description: Error en el sistema.
 */
router.get('/health', getHealthCheck);

export default router;
