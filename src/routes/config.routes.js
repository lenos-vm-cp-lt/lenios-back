import { Router } from 'express';
import { autenticar } from '../middlewares/auth.middleware.js';
import { autorizar } from '../middlewares/roles.middleware.js';
import { getEstadoNegocio, updateEstadoNegocio } from '../controllers/config.controller.js';

const router = Router();

/**
 * @openapi
 * /config/estado:
 *   get:
 *     tags:
 *       - Configuración
 *     summary: Obtener estado del negocio
 *     description: Retorna si el negocio está abierto y un mensaje informativo.
 *     responses:
 *       200:
 *         description: Estado obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Configuracion'
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/estado', getEstadoNegocio);

/**
 * @openapi
 * /config/estado:
 *   patch:
 *     tags:
 *       - Configuración
 *     summary: Actualizar estado del negocio
 *     description: Permite cambiar si el negocio está abierto. Requiere admin o editor.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConfiguracionInput'
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Configuracion'
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Token no proporcionado o inválido.
 *       403:
 *         description: No tiene permisos suficientes (admin/editor).
 *       500:
 *         description: Error interno del servidor.
 */
router.patch('/estado', autenticar, autorizar('admin', 'editor'), updateEstadoNegocio);

export default router;
