import Vulnerabilidad from '../models/Vulnerabilidad.js';
import { registrarAuditoria } from '../utils/auditLog.js';
import { successResponse, errorResponse } from '../utils/response.js';

export async function registrarVulnerabilidad(req, res) {
  try {
    const {
      tipo, descripcion, fechaOcurrencia, accionesCorrectivas,
    } = req.body;

    if (!tipo || !descripcion || !fechaOcurrencia || !accionesCorrectivas) {
      return errorResponse(
        res,
        400,
        'Campos requeridos: tipo, descripcion, fechaOcurrencia, accionesCorrectivas',
      );
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

    return successResponse(res, 201, 'Vulnerabilidad registrada exitosamente', vulnerabilidad);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
}

export async function listarVulnerabilidades(req, res) {
  try {
    const vulnerabilidades = await Vulnerabilidad.find().sort({ createdAt: -1 });
    return successResponse(res, 200, 'Lista de vulnerabilidades obtenida', vulnerabilidades);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}
