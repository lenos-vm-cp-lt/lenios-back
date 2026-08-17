import sanitizeHtml from 'sanitize-html';

/**
 * Elimina cualquier etiqueta HTML y atributo de un texto, previniendo XSS
 * almacenado en campos de texto libre (observaciones, nombres, descripciones).
 */
export function sanitizarTexto(texto) {
  if (typeof texto !== 'string') return texto;
  return sanitizeHtml(texto, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

export default sanitizarTexto;
