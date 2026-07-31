import { Router } from 'express';
import {
  solicitarAcceso,
  solicitarRectificacion,
  solicitarBloqueo,
  solicitarCancelacion,
} from '../controllers/arco.controller.js';

const router = Router();

/**
 * @openapi
 * /clientes/{id}/arco/acceso:
 *   post:
 *     tags:
 *       - Derechos ARCO
 *     summary: Solicitar Acceso a datos personales
 *     description: Permite al cliente acceder a sus datos personales almacenados en el sistema.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - telefono
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan Pérez
 *               telefono:
 *                 type: string
 *                 example: "5512345678"
 *     responses:
 *       200:
 *         description: Datos obtenidos exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 datos:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: string
 *                     telefono:
 *                       type: string
 *                     ubicacion:
 *                       type: string
 *       401:
 *         description: Identidad no validada.
 *       410:
 *         description: Datos no disponibles por bloqueo/anonimización.
 *       500:
 *         description: Error interno.
 */
router.post('/:id/arco/acceso', solicitarAcceso);

/**
 * @openapi
 * /clientes/{id}/arco/rectificacion:
 *   patch:
 *     tags:
 *       - Derechos ARCO
 *     summary: Solicitar Rectificación de datos personales
 *     description: Permite modificar el nombre, teléfono o ubicación del titular.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - telefono
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan Pérez
 *               telefono:
 *                 type: string
 *                 example: "5512345678"
 *               nuevoNombre:
 *                 type: string
 *                 example: Juan Carlos Pérez
 *               nuevoTelefono:
 *                 type: string
 *                 example: "5587654321"
 *               nuevaUbicacion:
 *                 type: string
 *                 example: Calle Falsa 123, Col. Centro
 *     responses:
 *       200:
 *         description: Datos actualizados exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 datos:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: string
 *                     telefono:
 *                       type: string
 *                     ubicacion:
 *                       type: string
 *       400:
 *         description: Error en la actualización.
 *       401:
 *         description: Identidad no validada.
 *       410:
 *         description: Datos bloqueados o anonimizados.
 */
router.patch('/:id/arco/rectificacion', solicitarRectificacion);

/**
 * @openapi
 * /clientes/{id}/arco/bloqueo:
 *   post:
 *     tags:
 *       - Derechos ARCO
 *     summary: Solicitar Oposición / Bloqueo de tratamiento de datos
 *     description: Bloquea el tratamiento de los datos personales.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - telefono
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan Pérez
 *               telefono:
 *                 type: string
 *                 example: "5512345678"
 *               motivo:
 *                 type: string
 *                 example: Ya no deseo recibir publicidad
 *     responses:
 *       200:
 *         description: Datos bloqueados exitosamente.
 *       400:
 *         description: Error al procesar solicitud.
 *       401:
 *         description: Identidad no validada.
 */
router.post('/:id/arco/bloqueo', solicitarBloqueo);

/**
 * @openapi
 * /clientes/{id}/arco/cancelacion:
 *   post:
 *     tags:
 *       - Derechos ARCO
 *     summary: Solicitar Cancelación / Anonimización de datos
 *     description: Anonimiza todos los datos identificables del cliente de forma permanente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - telefono
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan Pérez
 *               telefono:
 *                 type: string
 *                 example: "5512345678"
 *     responses:
 *       200:
 *         description: Datos anonimizados exitosamente.
 *       400:
 *         description: Error al procesar cancelación.
 *       401:
 *         description: Identidad no validada.
 */
router.post('/:id/arco/cancelacion', solicitarCancelacion);

export default router;
