import Vulnerabilidad from '../models/Vulnerabilidad.js';
import { registrarAuditoria } from '../utils/auditLog.js';

export async function registrarVulnerabilidad(req, res) {
  try {
    const {
      tipo, descripcion, fechaOcurrencia, accionesCorrectivas,
    } = req.body;

    if (!tipo || !descripcion || !fechaOcurrencia || !accionesCorrectivas) {
      return res.status(400).json({ error: 'Todos los campos son requeridos: tipo, descripcion, fechaOcurrencia, accionesCorrectivas' });
    }

    const vulnerabilidad = await Vulnerabilidad.create({
      tipo,
      descripcion,
      fechaOcurrencia,
      accionesCorrectivas,
      reportadoPor: req.usuario.id,
    });

    registrarAuditoria({
      accion: 'REGISTRAR_VULNERABILIDAD',
      usuarioId: req.usuario.id,
      recurso: 'Vulnerabilidad',
      // eslint-disable-next-line no-underscore-dangle
      recursoId: vulnerabilidad._id,
      resultado: 'exito',
    });

    return res.status(201).json(vulnerabilidad);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

export async function listarVulnerabilidades(req, res) {
  try {
    const vulnerabilidades = await Vulnerabilidad.find().sort({ createdAt: -1 });
    return res.json(vulnerabilidades);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
