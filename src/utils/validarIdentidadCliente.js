import Cliente from '../models/Cliente.js';

/**
 * Valida la identidad del solicitante ARCO comparando teléfono y nombre
 * contra el registro existente. Devuelve el cliente si coincide, o null.
 */
export async function validarIdentidadCliente(clienteId, telefono, nombre) {
  if (!telefono || !nombre) return null;

  const cliente = await Cliente.findById(clienteId);
  if (!cliente) return null;

  const telefonoCoincide = cliente.telefono === telefono;
  const nombreCoincide = cliente.nombre.toLowerCase().trim() === nombre.toLowerCase().trim();

  if (!telefonoCoincide || !nombreCoincide) return null;

  return cliente;
}
