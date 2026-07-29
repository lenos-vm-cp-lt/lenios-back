import { Router } from 'express';
import { crearMensajeWhatsApp } from '../controllers/whatsapp.controller.js';

const router = Router();

/**
 * @openapi
 * /pedidos/whatsapp:
 *   post:
 *     tags:
 *       - WhatsApp
 *     summary: Crear pedido y generar enlace de WhatsApp
 *     description: >
 *       Registra un nuevo pedido en la base de datos y genera un enlace
 *       de WhatsApp con el resumen del pedido listo para enviar al negocio.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WhatsAppInput'
 *           example:
 *             cliente:
 *               nombre: "María García"
 *               telefono: "5598765432"
 *               ubicacion: "Av. Siempre Viva 742, Col. Primavera"
 *             productos_solicitados:
 *               - nombre: "Leño Relleno Clásico"
 *                 cantidad: 2
 *                 precio_unitario: 65.00
 *               - nombre: "Leño Relleno Especial"
 *                 cantidad: 1
 *                 precio_unitario: 85.00
 *             total: 215.00
 *             observaciones: "Extra crema en el Especial"
 *     responses:
 *       201:
 *         description: Pedido creado y enlace de WhatsApp generado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WhatsAppResponse'
 *       400:
 *         description: >
 *           Datos inválidos. Puede ser por: cliente incompleto, lista de
 *           productos vacía, campos de producto faltantes, o total inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorWhatsApp'
 *             example:
 *               success: false
 *               message: "La información del cliente (nombre, telefono, ubicacion) es obligatoria."
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorWhatsApp'
 *             example:
 *               success: false
 *               message: "Ocurrió un error interno en el servidor."
 *               error: "Detalle del error"
 */
// POST /whatsapp -> Vinculado a crearMensajeWhatsApp
router.post('/', crearMensajeWhatsApp);

export default router;
