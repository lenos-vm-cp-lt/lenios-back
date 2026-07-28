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

    const usuario = await Usuario.findById(payload.id);
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: 'Usuario no válido o inactivo' });
    }

    // eslint-disable-next-line no-underscore-dangle
    req.usuario = { id: usuario._id, rol: usuario.rol, email: usuario.email };
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
