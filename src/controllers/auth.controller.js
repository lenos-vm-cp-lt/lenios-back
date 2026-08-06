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
        telefono: usuario.telefono || '',
        ubicacion: usuario.ubicacion || '',
        avisoPrivacidadAceptado: !!usuario.avisoPrivacidadAceptado,
        fechaAceptacionAviso: usuario.fechaAceptacionAviso || null,
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

export async function registro(req, res) {
  try {
    const {
      nombre, email, password, telefono, ubicacion, avisoPrivacidadAceptado,
    } = req.body;

    if (!nombre || !email || !password) {
      return errorResponse(res, 400, 'Nombre, email y contraseña son requeridos');
    }

    const usuarioExistente = await Usuario.findOne({ email: email.toLowerCase() });
    if (usuarioExistente) {
      return errorResponse(res, 400, 'El correo electrónico ya está registrado');
    }

    const nuevoUsuario = new Usuario({
      nombre,
      email: email.toLowerCase(),
      password,
      telefono: telefono || '',
      ubicacion: ubicacion || '',
      rol: 'cliente',
      avisoPrivacidadAceptado: !!avisoPrivacidadAceptado,
      fechaAceptacionAviso: avisoPrivacidadAceptado ? new Date() : null,
    });

    await nuevoUsuario.save();

    // eslint-disable-next-line no-underscore-dangle
    const token = firmarToken({ id: nuevoUsuario._id, rol: nuevoUsuario.rol });

    registrarAuditoria({
      accion: 'REGISTRO_USUARIO',
      // eslint-disable-next-line no-underscore-dangle
      usuarioId: nuevoUsuario._id.toString(),
      recurso: 'Usuario',
      // eslint-disable-next-line no-underscore-dangle
      recursoId: nuevoUsuario._id.toString(),
      resultado: 'exito',
    });

    return successResponse(res, 201, 'Usuario registrado exitosamente', {
      token,
      usuario: {
        // eslint-disable-next-line no-underscore-dangle
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
        telefono: nuevoUsuario.telefono,
        ubicacion: nuevoUsuario.ubicacion,
        avisoPrivacidadAceptado: nuevoUsuario.avisoPrivacidadAceptado,
        fechaAceptacionAviso: nuevoUsuario.fechaAceptacionAviso,
      },
    });
  } catch (error) {
    registrarAuditoria({
      accion: 'REGISTRO_USUARIO',
      usuarioId: null,
      recurso: 'Usuario',
      resultado: 'error',
    });
    return errorResponse(res, 500, error.message);
  }
}

export async function aceptarAvisoPrivacidad(req, res) {
  try {
    const usuarioId = req.usuario?.id;
    if (!usuarioId) {
      return errorResponse(res, 401, 'Usuario no autenticado');
    }

    const usuario = await Usuario.findByIdAndUpdate(
      usuarioId,
      {
        avisoPrivacidadAceptado: true,
        fechaAceptacionAviso: new Date(),
      },
      { new: true },
    );

    if (!usuario) {
      return errorResponse(res, 404, 'Usuario no encontrado');
    }

    registrarAuditoria({
      accion: 'ACEPTAR_AVISO_PRIVACIDAD',
      // eslint-disable-next-line no-underscore-dangle
      usuarioId: usuario._id,
      recurso: 'Usuario',
      // eslint-disable-next-line no-underscore-dangle
      recursoId: usuario._id,
      resultado: 'exito',
    });

    return successResponse(res, 200, 'Aviso de Privacidad aceptado exitosamente', {
      usuario: {
        // eslint-disable-next-line no-underscore-dangle
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        telefono: usuario.telefono || '',
        ubicacion: usuario.ubicacion || '',
        avisoPrivacidadAceptado: usuario.avisoPrivacidadAceptado,
        fechaAceptacionAviso: usuario.fechaAceptacionAviso,
      },
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}

export async function getPerfil(req, res) {
  try {
    const usuarioId = req.usuario?.id;
    if (!usuarioId) {
      return errorResponse(res, 401, 'Usuario no autenticado');
    }

    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return errorResponse(res, 404, 'Usuario no encontrado');
    }

    return successResponse(res, 200, 'Perfil de usuario obtenido', {
      usuario: {
        // eslint-disable-next-line no-underscore-dangle
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        telefono: usuario.telefono || '',
        ubicacion: usuario.ubicacion || '',
        avisoPrivacidadAceptado: !!usuario.avisoPrivacidadAceptado,
        fechaAceptacionAviso: usuario.fechaAceptacionAviso || null,
      },
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}
