import Configuracion from '../models/Configuracion.js';
import { registrarAuditoria } from '../utils/auditLog.js';

/**
 * Consulta pública del estado del restaurante.
 * Si no existe una configuración inicial, crea una por defecto.
 */
export async function getEstadoNegocio(req, res) {
  try {
    let config = await Configuracion.findOne();
    if (!config) {
      config = await Configuracion.create({ abierto: true, mensaje: '' });
    }
    return res.json(config);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Actualiza el estado del restaurante. Requiere rol admin/editor.
 */
export async function updateEstadoNegocio(req, res) {
  try {
    const { abierto, mensaje } = req.body;

    if (abierto === undefined) {
      return res.status(400).json({ error: 'El campo abierto es obligatorio.' });
    }

    let config = await Configuracion.findOne();
    if (!config) {
      config = await Configuracion.create({ abierto, mensaje: mensaje || '' });
    } else {
      config.abierto = abierto;
      config.mensaje = mensaje !== undefined ? mensaje : config.mensaje;
      await config.save();
    }

    registrarAuditoria({
      accion: 'ACTUALIZAR_ESTADO_NEGOCIO',
      usuarioId: req.usuario.id,
      recurso: 'Configuracion',
      // eslint-disable-next-line no-underscore-dangle
      recursoId: config._id,
      resultado: 'exito',
    });

    return res.json(config);
  } catch (error) {
    registrarAuditoria({
      accion: 'ACTUALIZAR_ESTADO_NEGOCIO',
      usuarioId: req.usuario ? req.usuario.id : 'anonimo',
      recurso: 'Configuracion',
      resultado: 'fallo',
    });
    return res.status(400).json({ error: error.message });
  }
}
