import Usuario from '../models/Usuario.js';
import { firmarToken } from '../utils/jwt.js';
import { registrarAuditoria } from '../utils/auditLog.js';
import { successResponse, errorResponse } from '../utils/response.js';

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Email y password son requeridos');
    }

    const usuario = await Usuario.findOne({ email }).select('+password');
    if (!usuario || !usuario.activo) {
      registrarAuditoria({
        accion: 'LOGIN',
        usuarioId: null,
        recurso: 'Usuario',
        resultado: 'fallo',
      });
      return errorResponse(res, 401, 'Credenciales inválidas');
    }

    const passwordValido = await usuario.compararPassword(password);
    if (!passwordValido) {
      registrarAuditoria({
        accion: 'LOGIN',
        // eslint-disable-next-line no-underscore-dangle
        usuarioId: usuario._id,
        recurso: 'Usuario',
        resultado: 'fallo',
      });
      return errorResponse(res, 401, 'Credenciales inválidas');
    }

    // eslint-disable-next-line no-underscore-dangle
    const token = firmarToken({ id: usuario._id, rol: usuario.rol });

    registrarAuditoria({
      accion: 'LOGIN',
      // eslint-disable-next-line no-underscore-dangle
      usuarioId: usuario._id,
      recurso: 'Usuario',
      // eslint-disable-next-line no-underscore-dangle
      recursoId: usuario._id,
      resultado: 'exito',
    });

    return successResponse(res, 200, 'Sesión iniciada exitosamente', {
      token,
      usuario: {
        // eslint-disable-next-line no-underscore-dangle
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    registrarAuditoria({
      accion: 'LOGIN',
      usuarioId: null,
      recurso: 'Usuario',
      resultado: 'error',
    });
    return errorResponse(res, 500, error.message);
  }
}
