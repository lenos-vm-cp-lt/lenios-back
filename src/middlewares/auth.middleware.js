import { verificarToken } from '../utils/jwt.js';
import Usuario from '../models/Usuario.js';

export async function autenticar(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    const payload = verificarToken(token);

    if (!payload || !payload.id) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    let userRole = payload.rol || 'cliente';
    let userEmail = payload.email || '';

    try {
      const usuario = await Usuario.findById(payload.id);
      if (usuario) {
        if (!usuario.activo) {
          return res.status(401).json({ error: 'Usuario no válido o inactivo' });
        }
        userRole = usuario.rol;
        userEmail = usuario.email;
      }
    } catch (dbErr) {
      // Si la consulta en DB falla o el id es sintético, se mantiene el rol verificado del token
    }

    req.usuario = { id: payload.id, rol: userRole, email: userEmail };
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

