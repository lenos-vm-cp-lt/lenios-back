import logger from '../config/logger.js';

/**
 * Registra una acción de auditoría SIN datos personales identificables.
 * Solo IDs de referencia, nunca nombre/telefono/ubicacion en texto plano.
 */
export function registrarAuditoria({
  accion, usuarioId, recurso, recursoId, resultado = 'exito',
}) {
  logger.info('Accion de auditoria', {
    accion,
    usuarioId: usuarioId || 'anonimo',
    recurso,
    recursoId: recursoId || null,
    resultado,
  });
}
