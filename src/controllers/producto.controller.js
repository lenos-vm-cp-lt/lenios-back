import Producto from '../models/Producto.js';
import { registrarAuditoria } from '../utils/auditLog.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { sanitizarTexto } from '../utils/sanitize.js';

/**
 * Retorna únicamente los productos que cumplan con disponible: true y stock > 0
 */
export async function getProductosPublicos(req, res) {
  try {
    const productos = await Producto.find({ disponible: true, stock: { $gt: 0 } });
    return successResponse(res, 200, 'Productos obtenidos exitosamente', productos);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

/**
 * Retorna todos los productos sin filtros de visibilidad/stock
 */
export async function getProductosAdmin(req, res) {
  try {
    const productos = await Producto.find();
    return successResponse(res, 200, 'Catálogo completo obtenido exitosamente', productos);
  } catch (error) {
    return errorResponse(res, 500, error.message);
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
      return errorResponse(res, 400, 'Los campos nombre, precio, stock y categoria son requeridos.');
    }

    const nuevoProducto = await Producto.create({
      nombre: sanitizarTexto(nombre),
      descripcion: sanitizarTexto(descripcion),
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
      ip: req.ip,
    });

    return successResponse(res, 201, 'Producto creado exitosamente', nuevoProducto);
  } catch (error) {
    registrarAuditoria({
      accion: 'CREAR_PRODUCTO',
      usuarioId: req.usuario ? req.usuario.id : 'anonimo',
      recurso: 'Producto',
      resultado: 'fallo',
      ip: req.ip,
    });
    return errorResponse(res, 400, error.message);
  }
}

/**
 * Actualiza un producto existente
 */
export async function updateProducto(req, res) {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.nombre !== undefined) {
      updateData.nombre = sanitizarTexto(updateData.nombre);
    }
    if (updateData.descripcion !== undefined) {
      updateData.descripcion = sanitizarTexto(updateData.descripcion);
    }

    const producto = await Producto.findById(id);
    if (!producto) {
      return errorResponse(res, 404, 'Producto no encontrado');
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
      ip: req.ip,
    });

    return successResponse(res, 200, 'Producto actualizado exitosamente', productoActualizado);
  } catch (error) {
    registrarAuditoria({
      accion: 'ACTUALIZAR_PRODUCTO',
      usuarioId: req.usuario ? req.usuario.id : 'anonimo',
      recurso: 'Producto',
      recursoId: req.params.id,
      resultado: 'fallo',
    });
    return errorResponse(res, 400, error.message);
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
      return errorResponse(res, 404, 'Producto no encontrado');
    }

    await Producto.findByIdAndDelete(id);

    registrarAuditoria({
      accion: 'ELIMINAR_PRODUCTO',
      usuarioId: req.usuario.id,
      recurso: 'Producto',
      recursoId: id,
      resultado: 'exito',
      ip: req.ip,
    });

    return successResponse(res, 200, 'Producto eliminado exitosamente');
  } catch (error) {
    registrarAuditoria({
      accion: 'ELIMINAR_PRODUCTO',
      usuarioId: req.usuario ? req.usuario.id : 'anonimo',
      recurso: 'Producto',
      recursoId: req.params.id,
      resultado: 'fallo',
      ip: req.ip,
    });
    return errorResponse(res, 500, error.message);
  }
}
