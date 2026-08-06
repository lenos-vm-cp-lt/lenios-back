import { Router } from 'express';
import { getDashboardMetrics } from '../controllers/admin.controller.js';

const router = Router();

/**
 * @swagger
 * /admin/dashboard/metrics:
 *   get:
 *     summary: Obtener métricas e indicadores del Dashboard de Administración
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Métricas obtenidas exitosamente
 */
router.get('/metrics', getDashboardMetrics);

export default router;
