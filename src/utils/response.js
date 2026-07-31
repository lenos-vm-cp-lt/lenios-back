/**
 * Retorna un JSON de respuesta exitosa.
 */
export function successResponse(res, statusCode = 200, message = 'Operación exitosa', data = null) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Retorna un JSON de respuesta con error.
 */
export function errorResponse(res, statusCode = 500, message = 'Ocurrió un error', errorDetails = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    error: errorDetails,
  });
}
