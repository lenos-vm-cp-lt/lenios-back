import { Router } from 'express';
import Pedido from '../models/Pedido.js';

const router = Router();

/**
 * @openapi
 * /pedidos:
 *   get:
 *     tags:
 *       - Pedidos
 *     summary: Listar todos los pedidos
 *     description: Retorna todos los pedidos registrados en el sistema. No requiere autenticación.
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
router.get('/', async (req, res) => {
  try {
    const pedidos = await Pedido.find();
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
router.post('/', async (req, res) => {
  try {
    const nuevoPedido = await Pedido.create(req.body);
    res.status(201).json(nuevoPedido);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
