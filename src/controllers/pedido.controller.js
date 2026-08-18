import Pedido from '../models/Pedido.js';
import Producto from '../models/Producto.js';
import Usuario from '../models/Usuario.js';
import { registrarAuditoria } from '../utils/auditLog.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { sanitizarTexto } from '../utils/sanitize.js';

const ESTADOS_VALIDOS = ['Pendiente', 'En preparacion', 'En camino', 'Entregado', 'Cancelado'];

/**
 * Obtener todos los pedidos ordenados cronológicamente
 */
export async function getPedidos(req, res) {
  try {
    const rawPedidos = await Pedido.find().sort({ createdAt: -1 });
    const pedidos = rawPedidos.map((p) => {
      const obj = p.toObject();
      const entrega = obj.metodoEntrega || obj.metodo_entrega || obj.metodo_envio || 'A domicilio';
      const pago = obj.metodoPago || obj.metodo_pago || 'Efectivo';
      const pagoRecibido = obj.pago_recibido !== undefined ? obj.pago_recibido : (obj.estado_pago === 'Pagado' || obj.estado === 'Entregado');
      const estadoPago = obj.estado_pago || (pagoRecibido ? 'Pagado' : 'Pendiente');
      return {
        ...obj,
        metodoEntrega: entrega,
        metodo_entrega: entrega,
        metodo_envio: entrega,
        metodoPago: pago,
        metodo_pago: pago,
        pago_recibido: pagoRecibido,
        pagoRecibido,
        estado_pago: estadoPago,
        estadoPago,
      };
    });
    return successResponse(res, 200, 'Pedidos obtenidos exitosamente', pedidos);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

/**
 * Registrar un pedido directo en el sistema
 * SOLO acepta del cliente: datos de contacto, productos (id + cantidad),
 * método de entrega/pago y notas. total, precio_unitario, nombre, estado
 * y pago_recibido SIEMPRE se calculan en el servidor.
 */
export async function createPedido(req, res) {
  try {
    const usuarioId = req.usuario?.id;
    if (usuarioId) {
      const usuario = await Usuario.findById(usuarioId);
      if (usuario && !usuario.avisoPrivacidadAceptado) {
        return errorResponse(res, 403, 'Debes aceptar el Aviso de Privacidad para realizar pedidos.');
      }
    }

    const {
      cliente,
      productos_solicitados: productosRecibidos,
      metodoEntrega, metodo_entrega: metodoEntregaAlt, metodo_envio: metodoEnvioAlt,
      metodoPago, metodo_pago: metodoPagoAlt,
      notas: notasRaw, observaciones: observacionesRaw,
    } = req.body;

    if (!cliente || !cliente.nombre || !cliente.telefono || !cliente.ubicacion) {
      return errorResponse(res, 400, 'Los datos del cliente (nombre, teléfono, ubicación) son requeridos');
    }

    if (!Array.isArray(productosRecibidos) || productosRecibidos.length === 0) {
      return errorResponse(res, 400, 'Debes incluir al menos un producto en el pedido');
    }

    // ── Recalcular productos y total DESDE LA BASE DE DATOS (nunca confiar en el body) ──
    let total = 0;
    const productosVerificados = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const item of productosRecibidos) {
      const cantidad = Number(item.cantidad);
      if (!item.id_producto || !cantidad || cantidad < 1) {
        return errorResponse(res, 400, 'Cada producto requiere id_producto y cantidad válida');
      }

      // eslint-disable-next-line no-await-in-loop
      const productoDb = await Producto.findById(item.id_producto);
      if (!productoDb || !productoDb.disponible) {
        return errorResponse(res, 400, `Producto no disponible: ${item.id_producto}`);
      }
      if (productoDb.stock < cantidad) {
        return errorResponse(res, 400, `Stock insuficiente para ${productoDb.nombre}`);
      }

      productosVerificados.push({
        id_producto: productoDb._id, // eslint-disable-line no-underscore-dangle
        nombre: productoDb.nombre,
        cantidad,
        precio_unitario: productoDb.precio,
      });
      total += productoDb.precio * cantidad;
    }

    const entrega = metodoEntrega || metodoEntregaAlt || metodoEnvioAlt || 'A domicilio';
    const pago = metodoPago || metodoPagoAlt || 'Efectivo';
    const notas = sanitizarTexto(notasRaw || observacionesRaw || '');
    const esTarjeta = pago.toLowerCase().includes('tarjeta');

    const payload = {
      cliente: {
        nombre: sanitizarTexto(cliente.nombre),
        telefono: sanitizarTexto(cliente.telefono),
        ubicacion: sanitizarTexto(cliente.ubicacion),
      },
      productos_solicitados: productosVerificados,
      total, // calculado por el servidor, NUNCA del body
      estado: 'Pendiente', // todo pedido nuevo inicia igual, no lo decide el cliente
      metodoEntrega: entrega,
      metodo_entrega: entrega,
      metodo_envio: entrega,
      metodoPago: pago,
      metodo_pago: pago,
      notas,
      observaciones: notas,
      // Solo se asume pagado si es tarjeta (pasarela); nunca por dicho del cliente
      pago_recibido: esTarjeta,
      estado_pago: esTarjeta ? 'Pagado' : 'Pendiente',
    };

    const nuevoPedido = await Pedido.create(payload);

    // Descontar stock de los productos vendidos
    await Promise.all(productosVerificados.map((p) => Producto.findByIdAndUpdate(
      p.id_producto,
      { $inc: { stock: -p.cantidad } },
    )));

    registrarAuditoria({
      accion: 'CREAR_PEDIDO',
      usuarioId: req.usuario?.id || 'cliente_registrado',
      recurso: 'Pedido',
      // eslint-disable-next-line no-underscore-dangle
      recursoId: nuevoPedido._id,
      resultado: 'exito',
      ip: req.ip,
    });
    return successResponse(res, 201, 'Pedido creado exitosamente', nuevoPedido);
  } catch (error) {
    registrarAuditoria({
      accion: 'CREAR_PEDIDO',
      usuarioId: req.usuario?.id || 'cliente',
      recurso: 'Pedido',
      resultado: 'fallo',
      ip: req.ip,
    });
    return errorResponse(res, 400, error.message);
  }
}

/**
 * Actualizar el estado de un pedido
 */
export async function updateEstadoPedido(req, res) {
  try {
    const rawEstado = req.body.estado || req.body.status || req.body.nuevoEstado;

    if (!rawEstado || typeof rawEstado !== 'string') {
      return errorResponse(res, 400, 'El campo estado es requerido');
    }

    // Normalizar string: remover guiones bajos, tildes y espacios
    const clean = rawEstado
      .toLowerCase()
      .replace(/_/g, ' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    let estadoNormalizado = '';
    if (clean === 'en camino') {
      estadoNormalizado = 'En camino';
    } else if (clean === 'en preparacion') {
      estadoNormalizado = 'En preparacion';
    } else if (clean === 'pendiente') {
      estadoNormalizado = 'Pendiente';
    } else if (clean === 'entregado') {
      estadoNormalizado = 'Entregado';
    } else if (clean === 'cancelado') {
      estadoNormalizado = 'Cancelado';
    } else {
      return errorResponse(
        res,
        400,
        `Estado no válido. Estados permitidos: ${ESTADOS_VALIDOS.join(', ')}`,
      );
    }

    const updateFields = { estado: estadoNormalizado };

    // Si el estado cambia a 'Entregado', el pago se auto-marca como Recibido/Pagado automáticamente
    if (estadoNormalizado === 'Entregado') {
      updateFields.pago_recibido = true;
      updateFields.estado_pago = 'Pagado';
    }

    const pedidoActualizado = await Pedido.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true },
    );

    if (!pedidoActualizado) {
      return errorResponse(res, 404, 'Pedido no encontrado');
    }

    registrarAuditoria({
      accion: 'ACTUALIZAR_ESTADO_PEDIDO',
      usuarioId: req.usuario?.id || 'admin',
      recurso: 'Pedido',
      recursoId: req.params.id,
      resultado: 'exito',
      ip: req.ip,
    });

    return successResponse(res, 200, 'Estado del pedido actualizado', pedidoActualizado);
  } catch (error) {
    registrarAuditoria({
      accion: 'ACTUALIZAR_ESTADO_PEDIDO',
      usuarioId: req.usuario?.id || null,
      recurso: 'Pedido',
      recursoId: req.params.id,
      resultado: 'fallo',
      ip: req.ip,
    });
    return errorResponse(res, 500, error.message);
  }
}

/**
 * Actualizar el estado de pago de un pedido (Efectivo / Transferencia recibido o pendiente)
 * NOTA: este endpoint debe estar protegido en las rutas para uso exclusivo de admin,
 * ya que le permite marcar un pedido como pagado.
 */
export async function updatePagoPedido(req, res) {
  try {
    const { pagoRecibido, estadoPago } = req.body;
    const isPagado = pagoRecibido === true || estadoPago === 'Pagado' || estadoPago === 'Recibido';

    const pedidoActualizado = await Pedido.findByIdAndUpdate(
      req.params.id,
      {
        pago_recibido: isPagado,
        estado_pago: isPagado ? 'Pagado' : 'Pendiente',
      },
      { new: true },
    );

    if (!pedidoActualizado) {
      return errorResponse(res, 404, 'Pedido no encontrado');
    }

    registrarAuditoria({
      accion: 'ACTUALIZAR_PAGO_PEDIDO',
      usuarioId: req.usuario?.id || 'admin',
      recurso: 'Pedido',
      recursoId: req.params.id,
      resultado: 'exito',
      ip: req.ip,
    });

    return successResponse(res, 200, 'Estado de pago actualizado correctamente', pedidoActualizado);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}
