import Pedido from '../models/Pedido.js';
import SolicitudArco from '../models/SolicitudArco.js';
import { validarIdentidadCliente } from '../utils/validarIdentidadCliente.js';
import { registrarAuditoria } from '../utils/auditLog.js';

const IDENTIDAD_INVALIDA = 'No se pudo validar tu identidad. Verifica tu nombre y teléfono registrados.';

// ─── Derecho de ACCESO ─────────────────────────────────────────────
export async function solicitarAcceso(req, res) {
  try {
    const { telefono, nombre } = req.body;
    const cliente = await validarIdentidadCliente(req.params.id, telefono, nombre);

    if (!cliente) {
      registrarAuditoria({
        accion: 'ARCO_ACCESO', usuarioId: 'cliente_publico', recurso: 'Cliente', recursoId: req.params.id, resultado: 'fallo',
      });
      return res.status(401).json({ error: IDENTIDAD_INVALIDA });
    }

    if (cliente.bloqueado || cliente.anonimizado) {
      return res.status(410).json({ error: 'Tus datos ya no están disponibles (bloqueados o anonimizados).' });
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

    return res.json({
      mensaje: 'Estos son tus datos personales registrados.',
      datos: {
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        ubicacion: cliente.ubicacion,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
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
        accion: 'ARCO_RECTIFICACION', usuarioId: 'cliente_publico', recurso: 'Cliente', recursoId: req.params.id, resultado: 'fallo',
      });
      return res.status(401).json({ error: IDENTIDAD_INVALIDA });
    }

    if (cliente.bloqueado || cliente.anonimizado) {
      return res.status(410).json({ error: 'Tus datos ya no están disponibles (bloqueados o anonimizados).' });
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

    return res.json({
      mensaje: 'Tus datos fueron actualizados correctamente.',
      datos: {
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        ubicacion: cliente.ubicacion,
      },
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

// ─── Derecho de OPOSICIÓN / BLOQUEO ────────────────────────────────
export async function solicitarBloqueo(req, res) {
  try {
    const { telefono, nombre, motivo } = req.body;
    const cliente = await validarIdentidadCliente(req.params.id, telefono, nombre);

    if (!cliente) {
      registrarAuditoria({
        accion: 'ARCO_BLOQUEO', usuarioId: 'cliente_publico', recurso: 'Cliente', recursoId: req.params.id, resultado: 'fallo',
      });
      return res.status(401).json({ error: IDENTIDAD_INVALIDA });
    }

    cliente.bloqueado = true;
    await cliente.save();

    await SolicitudArco.create({
      // eslint-disable-next-line no-underscore-dangle
      clienteId: cliente._id,
      tipo: 'oposicion',
      detalleSolicitud: motivo || '',
      respuesta: 'Tus datos personales fueron bloqueados y ya no serán tratados, salvo por obligaciones legales pendientes.',
    });

    registrarAuditoria({
      accion: 'ARCO_BLOQUEO',
      usuarioId: 'cliente_publico',
      recurso: 'Cliente',
      // eslint-disable-next-line no-underscore-dangle
      recursoId: cliente._id,
      resultado: 'exito',
    });

    return res.json({ mensaje: 'Tus datos fueron bloqueados correctamente.' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

// ─── Derecho de CANCELACIÓN (anonimización) ────────────────────────
export async function solicitarCancelacion(req, res) {
  try {
    const { telefono, nombre } = req.body;
    const cliente = await validarIdentidadCliente(req.params.id, telefono, nombre);

    if (!cliente) {
      registrarAuditoria({
        accion: 'ARCO_CANCELACION', usuarioId: 'cliente_publico', recurso: 'Cliente', recursoId: req.params.id, resultado: 'fallo',
      });
      return res.status(401).json({ error: IDENTIDAD_INVALIDA });
    }

    const telefonoOriginal = cliente.telefono;

    // Anonimiza el documento Cliente
    cliente.nombre = '[DATO ELIMINADO]';
    cliente.telefono = '[DATO ELIMINADO]';
    cliente.ubicacion = '[DATO ELIMINADO]';
    cliente.anonimizado = true;
    cliente.bloqueado = true;
    await cliente.save();

    // Anonimiza las copias embebidas en el histórico de pedidos,
    // sin borrar los pedidos (se conserva el histórico de ventas)
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
      respuesta: 'Tus datos personales fueron anonimizados. El histórico de compras se conserva sin datos identificables, conforme a la ley.',
    });

    registrarAuditoria({
      accion: 'ARCO_CANCELACION',
      usuarioId: 'cliente_publico',
      recurso: 'Cliente',
      // eslint-disable-next-line no-underscore-dangle
      recursoId: cliente._id,
      resultado: 'exito',
    });

    return res.json({ mensaje: 'Tus datos fueron anonimizados correctamente. Tu historial de compras se conserva sin información identificable.' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
