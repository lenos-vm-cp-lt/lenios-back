import { Router } from 'express';
import Producto from '../models/Producto.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import { autorizar } from '../middlewares/roles.middleware.js';
import { registrarAuditoria } from '../utils/auditLog.js';

const router = Router();

/**
 * @openapi
 * /productos:
 *   get:
 *     tags:
 *       - Productos
 *     summary: Listar todos los productos
 *     description: Retorna el catálogo completo de productos disponibles
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Producto'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /productos:
 *   post:
 *     tags:
 *       - Productos
 *     summary: Crear un nuevo producto
 *     description: Crea un producto en el catálogo admin y editor.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductoInput'
 *           example:
 *             nombre: "Leño Relleno Especial"
 *             descripcion: "Con queso, champiñones y jalapeños"
 *             precio: 85.00
 *             imagen: "https://cdn.ejemplo.com/leno-especial.jpg"
 *             disponible: true
 *             stock: 20
 *     responses:
 *       201:
 *         description: Producto creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       400:
 *         description: Datos inválidos o campos faltantes.
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
 *       403:
 *         description: El usuario no tiene el rol requerido (admin o editor).
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
router.post('/', autenticar, autorizar('admin', 'editor'), async (req, res) => {
  try {
    const nuevoProducto = await Producto.create(req.body);
    registrarAuditoria({
      accion: 'CREAR_PRODUCTO',
      usuarioId: req.usuario.id,
      recurso: 'Producto',
      // eslint-disable-next-line no-underscore-dangle
      recursoId: nuevoProducto._id,
      resultado: 'exito',
    });
    res.status(201).json(nuevoProducto);
  } catch (error) {
    registrarAuditoria({
      accion: 'CREAR_PRODUCTO',
      usuarioId: req.usuario.id,
      recurso: 'Producto',
      resultado: 'fallo',
    });
    res.status(400).json({ error: error.message });
  }
});

export default router;
