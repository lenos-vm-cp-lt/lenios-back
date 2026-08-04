import { Router } from 'express';
import { autenticar } from '../middlewares/auth.middleware.js';
import { autorizar } from '../middlewares/roles.middleware.js';
import {
  getPedidos,
  createPedido,
  updateEstadoPedido,
} from '../controllers/pedido.controller.js';

const router = Router();

/**
 * @openapi
 * /pedidos:
 *   get:
 *     tags:
 *       - Pedidos
 *     summary: Listar todos los pedidos
 *     description: Retorna todos los pedidos registrados en el sistema, ordenados cronológicamente.
 *     responses:
 *       200:
 *         description: Lista de pedidos obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pedido'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', autenticar, autorizar('admin', 'editor'), getPedidos);

/**
 * @openapi
 * /pedidos:
 *   post:
 *     tags:
 *       - Pedidos
 *     summary: Crear un nuevo pedido
 *     description: Registra un pedido directo en el sistema sin generar enlace de WhatsApp.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PedidoInput'
 *           example:
 *             cliente:
 *               nombre: "Juan Pérez"
 *               telefono: "5512345678"
 *               ubicacion: "Calle Falsa 123, Col. Centro"
 *             productos_solicitados:
 *               - id_producto: "64a1b2c3d4e5f6789abcdef0"
 *                 nombre: "Leño Relleno Clásico"
 *                 cantidad: 2
 *                 precio_unitario: 65.00
 *             total: 130.00
 *             estado: "Pendiente"
 *             metodo_envio: "Domicilio"
 *             observaciones: "Sin cebolla"
 *     responses:
 *       201:
 *         description: Pedido creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pedido'
 *       400:
 *         description: Datos inválidos o campos faltantes.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', createPedido);

/**
 * @openapi
 * /pedidos/{id}/estado:
 *   patch:
 *     tags:
 *       - Pedidos
 *     summary: Actualizar el estado de un pedido
 *     description: Permite a un administrador autenticado cambiar el estado de un pedido existente.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pedido a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: ['Pendiente', 'En preparacion', 'Entregado', 'Cancelado']
 *           example:
 *             estado: "En preparacion"
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pedido'
 *       400:
 *         description: Estado no reconocido o campo faltante.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token JWT no proporcionado o inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Pedido no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id/estado', autenticar, autorizar('admin', 'editor'), updateEstadoPedido);

export default router;
