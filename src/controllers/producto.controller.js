import Producto from '../models/Producto.js';
import { registrarAuditoria } from '../utils/auditLog.js';

/**
 * Retorna únicamente los productos que cumplan con disponible: true y stock > 0
 */
export async function getProductosPublicos(req, res) {
  try {
    const productos = await Producto.find({ disponible: true, stock: { $gt: 0 } });
    return res.json(productos);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Retorna todos los productos sin filtros de visibilidad/stock
 */
export async function getProductosAdmin(req, res) {
  try {
    const productos = await Producto.find();
    return res.json(productos);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Crea un nuevo producto. Valida los campos requeridos.
 */
export async function createProducto(req, res) {
  try {
    const {
      nombre, descripcion, precio, imagen, categoria, disponible, stock,
    } = req.body;

    if (!nombre || precio === undefined || stock === undefined || !categoria) {
      return res.status(400).json({ error: 'Los campos nombre, precio, stock y categoria son obligatorios.' });
    }

    const nuevoProducto = await Producto.create({
      nombre,
      descripcion,
      precio,
      imagen,
      categoria,
      disponible,
      stock,
    });

    registrarAuditoria({
      accion: 'CREAR_PRODUCTO',
      usuarioId: req.usuario.id,
      recurso: 'Producto',
      // eslint-disable-next-line no-underscore-dangle
      recursoId: nuevoProducto._id,
      resultado: 'exito',
    });

    return res.status(201).json(nuevoProducto);
  } catch (error) {
    registrarAuditoria({
      accion: 'CREAR_PRODUCTO',
      usuarioId: req.usuario ? req.usuario.id : 'anonimo',
      recurso: 'Producto',
      resultado: 'fallo',
    });
    return res.status(400).json({ error: error.message });
  }
}

/**
 * Actualiza un producto existente
 */
export async function updateProducto(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const producto = await Producto.findById(id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const productoActualizado = await Producto.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    registrarAuditoria({
      accion: 'ACTUALIZAR_PRODUCTO',
      usuarioId: req.usuario.id,
      recurso: 'Producto',
      // eslint-disable-next-line no-underscore-dangle
      recursoId: productoActualizado._id,
      resultado: 'exito',
    });

    return res.json(productoActualizado);
  } catch (error) {
    registrarAuditoria({
      accion: 'ACTUALIZAR_PRODUCTO',
      usuarioId: req.usuario ? req.usuario.id : 'anonimo',
      recurso: 'Producto',
      recursoId: req.params.id,
      resultado: 'fallo',
    });
    return res.status(400).json({ error: error.message });
  }
}

/**
 * Elimina un producto de manera física
 */
export async function deleteProducto(req, res) {
  try {
    const { id } = req.params;

    const producto = await Producto.findById(id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await Producto.findByIdAndDelete(id);

    registrarAuditoria({
      accion: 'ELIMINAR_PRODUCTO',
      usuarioId: req.usuario.id,
      recurso: 'Producto',
      recursoId: id,
      resultado: 'exito',
    });

    return res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    registrarAuditoria({
      accion: 'ELIMINAR_PRODUCTO',
      usuarioId: req.usuario ? req.usuario.id : 'anonimo',
      recurso: 'Producto',
      recursoId: req.params.id,
      resultado: 'fallo',
    });
    return res.status(500).json({ error: error.message });
  }
}
