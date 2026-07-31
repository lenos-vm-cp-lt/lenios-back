import { Router } from 'express';
import { autenticar } from '../middlewares/auth.middleware.js';
import { autorizar } from '../middlewares/roles.middleware.js';
import {
  getProductosPublicos,
  getProductosAdmin,
  createProducto,
  updateProducto,
  deleteProducto,
} from '../controllers/producto.controller.js';

const router = Router();

/**
 * @openapi
 * /productos:
 *   get:
 *     tags:
 *       - Productos
 *     summary: Listar productos públicos
 *     description: Retorna solo productos con disponible=true y stock > 0.
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
router.get('/', getProductosPublicos);

/**
 * @openapi
 * /productos/admin:
 *   get:
 *     tags:
 *       - Productos
 *     summary: Listar todos los productos (Vista Admin)
 *     description: Retorna todo el catálogo sin filtros de visibilidad.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todos los productos obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Producto'
 *       401:
 *         description: Token JWT no proporcionado o inválido.
 *       403:
 *         description: No tiene permisos suficientes (admin/editor).
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/admin', autenticar, autorizar('admin', 'editor'), getProductosAdmin);

/**
 * @openapi
 * /productos:
 *   post:
 *     tags:
 *       - Productos
 *     summary: Crear un nuevo producto
 *     description: Crea un producto en el catálogo. Requiere rol admin o editor.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductoInput'
 *     responses:
 *       201:
 *         description: Producto creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       400:
 *         description: Datos inválidos o campos faltantes.
 *       401:
 *         description: Token JWT no proporcionado o inválido.
 *       403:
 *         description: No tiene permisos suficientes (admin/editor).
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/', autenticar, autorizar('admin', 'editor'), createProducto);

/**
 * @openapi
 * /productos/{id}:
 *   put:
 *     tags:
 *       - Productos
 *     summary: Actualizar un producto existente
 *     description: Modifica los campos de un producto por su ID. Requiere rol admin o editor.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductoInput'
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Token JWT no proporcionado o inválido.
 *       403:
 *         description: No tiene permisos suficientes (admin/editor).
 *       404:
 *         description: Producto no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.put('/:id', autenticar, autorizar('admin', 'editor'), updateProducto);

/**
 * @openapi
 * /productos/{id}:
 *   delete:
 *     tags:
 *       - Productos
 *     summary: Eliminar un producto
 *     description: Elimina un producto de manera física por su ID. Requiere rol admin o editor.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto a eliminar
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente.
 *       401:
 *         description: Token JWT no proporcionado o inválido.
 *       403:
 *         description: No tiene permisos suficientes (admin/editor).
 *       404:
 *         description: Producto no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.delete('/:id', autenticar, autorizar('admin', 'editor'), deleteProducto);

export default router;
