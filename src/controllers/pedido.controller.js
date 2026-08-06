import Pedido from '../models/Pedido.js';
import { registrarAuditoria } from '../utils/auditLog.js';
import { successResponse, errorResponse } from '../utils/response.js';

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
      return {
        ...obj,
        metodoEntrega: entrega,
        metodo_entrega: entrega,
        metodo_envio: entrega,
        metodoPago: pago,
        metodo_pago: pago,
      };
    });
    return successResponse(res, 200, 'Pedidos obtenidos exitosamente', pedidos);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

/**
 * Registrar un pedido directo en el sistema
 */
export async function createPedido(req, res) {
  try {
    const payload = { ...req.body };

    const entrega = payload.metodoEntrega || payload.metodo_entrega || payload.metodo_envio || 'A domicilio';
    const pago = payload.metodoPago || payload.metodo_pago || 'Efectivo';
    const notas = payload.notas || payload.observaciones || '';

    payload.metodoEntrega = entrega;
    payload.metodo_entrega = entrega;
    payload.metodo_envio = entrega;
    payload.metodoPago = pago;
    payload.metodo_pago = pago;
    payload.notas = notas;
    payload.observaciones = notas;

    const nuevoPedido = await Pedido.create(payload);
    registrarAuditoria({
      accion: 'CREAR_PEDIDO',
      usuarioId: 'cliente_publico',
      recurso: 'Pedido',
      // eslint-disable-next-line no-underscore-dangle
      recursoId: nuevoPedido._id,
      resultado: 'exito',
    });
    return successResponse(res, 201, 'Pedido creado exitosamente', nuevoPedido);
  } catch (error) {
    registrarAuditoria({
      accion: 'CREAR_PEDIDO',
      usuarioId: 'cliente_publico',
      recurso: 'Pedido',
      resultado: 'fallo',
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

    const pedidoActualizado = await Pedido.findByIdAndUpdate(
      req.params.id,
      { estado: estadoNormalizado },
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
    });

    return successResponse(res, 200, 'Estado del pedido actualizado', pedidoActualizado);
  } catch (error) {
    registrarAuditoria({
      accion: 'ACTUALIZAR_ESTADO_PEDIDO',
      usuarioId: req.usuario?.id || null,
      recurso: 'Pedido',
      recursoId: req.params.id,
      resultado: 'fallo',
    });
    return errorResponse(res, 500, error.message);
  }
}
