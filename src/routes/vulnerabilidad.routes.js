import { Router } from 'express';
import { autenticar } from '../middlewares/auth.middleware.js';
import { autorizar } from '../middlewares/roles.middleware.js';
import {
  registrarVulnerabilidad,
  listarVulnerabilidades,
} from '../controllers/vulnerabilidad.controller.js';

const router = Router();

/**
 * @openapi
 * /vulnerabilidades:
 *   post:
 *     tags:
 *       - Vulnerabilidades
 *     summary: Registrar vulnerabilidad de seguridad
 *     description: Registra una nueva vulnerabilidad. Solo accesible por Admin.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VulnerabilidadInput'
 *     responses:
 *       201:
 *         description: Vulnerabilidad registrada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vulnerabilidad'
 *       400:
 *         description: Campos faltantes o inválidos.
 *       401:
 *         description: No autenticado.
 *       403:
 *         description: No autorizado.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/', autenticar, autorizar('admin'), registrarVulnerabilidad);

/**
 * @openapi
 * /vulnerabilidades:
 *   get:
 *     tags:
 *       - Vulnerabilidades
 *     summary: Listar todas las vulnerabilidades
 *     description: Obtiene la lista de todas las vulnerabilidades. Solo accesible por Admin.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de vulnerabilidades obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vulnerabilidad'
 *       401:
 *         description: No autenticado.
 *       403:
 *         description: No autorizado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/', autenticar, autorizar('admin'), listarVulnerabilidades);

export default router;
