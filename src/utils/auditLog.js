import logger from '../config/logger.js';
import AuditLog from '../models/AuditLog.js';

/**
 * Registra una acción de auditoría SIN datos personales identificables.
 * Solo IDs de referencia, nunca nombre/telefono/ubicacion en texto plano.
 */
export async function registrarAuditoria({
  accion, usuarioId, recurso, recursoId, resultado = 'exito', ip = null,
}) {
  logger.info('Accion de auditoria', {
    accion,
    usuarioId: usuarioId || 'anonimo',
    recurso,
    recursoId: recursoId || null,
    resultado,
    ip,
  });

  try {
    await AuditLog.create({
      usuarioId: usuarioId || 'anonimo',
      accion,
      entidad: recurso,
      entidadId: recursoId || null,
      resultado,
      ip,
    });
  } catch (error) {
    logger.error('Error al guardar AuditLog en MongoDB', { error: error.message });
  }
}
