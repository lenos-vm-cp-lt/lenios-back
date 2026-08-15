import { Router } from 'express';
import { getDashboardMetrics, getAuditLogs } from '../controllers/admin.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import { autorizar } from '../middlewares/roles.middleware.js';

const router = Router();

// Proteger todas las rutas administrativas con autenticación y verificación de rol admin
router.use(autenticar, autorizar('admin'));

/**
 * @swagger
 * /admin/dashboard/metrics:
 *   get:
 *     summary: Obtener métricas e indicadores del Dashboard de Administración
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas obtenidas exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (Requiere rol admin)
 */
router.get('/metrics', getDashboardMetrics);

/**
 * @swagger
 * /admin/audit-logs:
 *   get:
 *     summary: Obtener registros de auditoría del sistema
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logs obtenidos exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (Requiere rol admin)
 */
router.get('/audit-logs', getAuditLogs);

export default router;

