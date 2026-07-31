import Pedido from '../models/Pedido.js';
import SolicitudArco from '../models/SolicitudArco.js';
import { validarIdentidadCliente } from '../utils/validarIdentidadCliente.js';
import { registrarAuditoria } from '../utils/auditLog.js';
import { successResponse, errorResponse } from '../utils/response.js';

const IDENTIDAD_INVALIDA = 'No se pudo validar tu identidad. Verifica tu nombre y teléfono.';

// ─── Derecho de ACCESO ─────────────────────────────────────────────
export async function solicitarAcceso(req, res) {
  try {
    const { telefono, nombre } = req.body;
    const cliente = await validarIdentidadCliente(req.params.id, telefono, nombre);

    if (!cliente) {
      registrarAuditoria({
        accion: 'ARCO_ACCESO',
        usuarioId: 'cliente_publico',
        recurso: 'Cliente',
        recursoId: req.params.id,
        resultado: 'fallo',
      });
      return errorResponse(res, 401, IDENTIDAD_INVALIDA);
    }

    if (cliente.bloqueado || cliente.anonimizado) {
      return errorResponse(res, 410, 'Tus datos ya no están disponibles.');
    }

    await SolicitudArco.create({
      // eslint-disable-next-line no-underscore-dangle
      clienteId: cliente._id,
      tipo: 'acceso',
      respuesta: 'Se entregaron los datos personales registrados al titular.',
    });

    registrarAuditoria({
      accion: 'ARCO_ACCESO',
      usuarioId: 'cliente_publico',
      recurso: 'Cliente',
      // eslint-disable-next-line no-underscore-dangle
      recursoId: cliente._id,
      resultado: 'exito',
    });

    return successResponse(res, 200, 'Estos son tus datos personales registrados.', {
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      ubicacion: cliente.ubicacion,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

// ─── Derecho de RECTIFICACIÓN ──────────────────────────────────────
export async function solicitarRectificacion(req, res) {
  try {
    const {
      telefono, nombre, nuevoNombre, nuevoTelefono, nuevaUbicacion,
    } = req.body;

    const cliente = await validarIdentidadCliente(req.params.id, telefono, nombre);
    if (!cliente) {
      registrarAuditoria({
        accion: 'ARCO_RECTIFICACION',
        usuarioId: 'cliente_publico',
        recurso: 'Cliente',
        recursoId: req.params.id,
        resultado: 'fallo',
      });
      return errorResponse(res, 401, IDENTIDAD_INVALIDA);
    }

    if (cliente.bloqueado || cliente.anonimizado) {
      return errorResponse(res, 410, 'Tus datos ya no están disponibles.');
    }

    if (nuevoNombre) cliente.nombre = nuevoNombre;
    if (nuevoTelefono) cliente.telefono = nuevoTelefono;
    if (nuevaUbicacion) cliente.ubicacion = nuevaUbicacion;
    await cliente.save();

    await SolicitudArco.create({
      // eslint-disable-next-line no-underscore-dangle
      clienteId: cliente._id,
      tipo: 'rectificacion',
      respuesta: 'Los datos personales fueron actualizados correctamente.',
    });

    registrarAuditoria({
      accion: 'ARCO_RECTIFICACION',
      usuarioId: 'cliente_publico',
      recurso: 'Cliente',
      // eslint-disable-next-line no-underscore-dangle
      recursoId: cliente._id,
      resultado: 'exito',
    });

    return successResponse(res, 200, 'Tus datos fueron actualizados correctamente.', {
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      ubicacion: cliente.ubicacion,
    });
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
}

// ─── Derecho de OPOSICIÓN / BLOQUEO ────────────────────────────────
export async function solicitarBloqueo(req, res) {
  try {
    const { telefono, nombre, motivo } = req.body;
    const cliente = await validarIdentidadCliente(req.params.id, telefono, nombre);

    if (!cliente) {
      registrarAuditoria({
        accion: 'ARCO_BLOQUEO',
        usuarioId: 'cliente_publico',
        recurso: 'Cliente',
        recursoId: req.params.id,
        resultado: 'fallo',
      });
      return errorResponse(res, 401, IDENTIDAD_INVALIDA);
    }

    cliente.bloqueado = true;
    await cliente.save();

    await SolicitudArco.create({
      // eslint-disable-next-line no-underscore-dangle
      clienteId: cliente._id,
      tipo: 'oposicion',
      detalleSolicitud: motivo || '',
      respuesta: 'Tus datos personales fueron bloqueados.',
    });

    registrarAuditoria({
      accion: 'ARCO_BLOQUEO',
      usuarioId: 'cliente_publico',
      recurso: 'Cliente',
      // eslint-disable-next-line no-underscore-dangle
      recursoId: cliente._id,
      resultado: 'exito',
    });

    return successResponse(res, 200, 'Tus datos fueron bloqueados correctamente.');
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
}

// ─── Derecho de CANCELACIÓN (anonimización) ────────────────────────
export async function solicitarCancelacion(req, res) {
  try {
    const { telefono, nombre } = req.body;
    const cliente = await validarIdentidadCliente(req.params.id, telefono, nombre);

    if (!cliente) {
      registrarAuditoria({
        accion: 'ARCO_CANCELACION',
        usuarioId: 'cliente_publico',
        recurso: 'Cliente',
        recursoId: req.params.id,
        resultado: 'fallo',
      });
      return errorResponse(res, 401, IDENTIDAD_INVALIDA);
    }

    const telefonoOriginal = cliente.telefono;

    // Anonimiza el documento Cliente
    cliente.nombre = '[DATO ELIMINADO]';
    cliente.telefono = '[DATO ELIMINADO]';
    cliente.ubicacion = '[DATO ELIMINADO]';
    cliente.anonimizado = true;
    cliente.bloqueado = true;
    await cliente.save();

    // Anonimiza las copias embebidas en el histórico de pedidos
    await Pedido.updateMany(
      { 'cliente.telefono': telefonoOriginal },
      {
        $set: {
          'cliente.nombre': '[DATO ELIMINADO]',
          'cliente.telefono': '[DATO ELIMINADO]',
          'cliente.ubicacion': '[DATO ELIMINADO]',
        },
      },
    );

    await SolicitudArco.create({
      // eslint-disable-next-line no-underscore-dangle
      clienteId: cliente._id,
      tipo: 'cancelacion',
      respuesta: 'Tus datos personales fueron anonimizados.',
    });

    registrarAuditoria({
      accion: 'ARCO_CANCELACION',
      usuarioId: 'cliente_publico',
      recurso: 'Cliente',
      // eslint-disable-next-line no-underscore-dangle
      recursoId: cliente._id,
      resultado: 'exito',
    });

    return successResponse(res, 200, 'Tus datos fueron anonimizados correctamente.');
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
}
