import Pedido from '../models/Pedido.js';
import { registrarAuditoria } from '../utils/auditLog.js';
import { successResponse, errorResponse } from '../utils/response.js';

const ESTADOS_VALIDOS = ['Pendiente', 'En preparacion', 'Entregado', 'Cancelado'];

/**
 * Obtener todos los pedidos ordenados cronológicamente
 */
export async function getPedidos(req, res) {
  try {
    const pedidos = await Pedido.find().sort({ createdAt: 1 });
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
    const nuevoPedido = await Pedido.create(req.body);
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
    const { estado } = req.body;

    if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
      return errorResponse(
        res,
        400,
        `Estado no válido. Estados permitidos: ${ESTADOS_VALIDOS.join(', ')}`,
      );
    }

    const pedidoActualizado = await Pedido.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true, runValidators: true },
    );

    if (!pedidoActualizado) {
      return errorResponse(res, 404, 'Pedido no encontrado');
    }

    registrarAuditoria({
      accion: 'ACTUALIZAR_ESTADO_PEDIDO',
      usuarioId: req.usuario.id,
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
