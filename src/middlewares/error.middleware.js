import { errorResponse } from '../utils/response.js';

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'Ocurrió un error interno en el servidor';
  let details = null;

  // Errores de Validación de Mongoose
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Error de validación en los datos provistos';
    details = Object.keys(err.errors).reduce((acc, key) => {
      acc[key] = err.errors[key].message;
      return acc;
    }, {});
  }

  // Error de Cast Mongoose (ID inválido)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Valor no válido para el campo: ${err.path}`;
  }

  // Error de Claves Duplicadas en MongoDB (index único)
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Registro duplicado. Algunos de los datos ya existen.';
  }

  // Errores de JSON Web Token (JWT)
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token no válido o corrupto';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'El token de sesión ha expirado';
  }

  // Ocultar stack trace en producción
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const errorData = isDevelopment
    ? { stack: err.stack, details }
    : { details };

  return errorResponse(res, statusCode, message, errorData);
}
