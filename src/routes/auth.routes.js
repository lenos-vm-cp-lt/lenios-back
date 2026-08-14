import { Router } from 'express';
import {
  login, registro, aceptarAvisoPrivacidad, getPerfil,
} from '../controllers/auth.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Autenticación
 *     summary: Iniciar sesión
 *     description: >
 *       Autentica a un usuario con email y contraseña.
 *       Retorna un token JWT que debe usarse como `Bearer` en el encabezado `Authorization`
 *       para acceder a las rutas protegidas.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *           example:
 *             email: "admin@lenosrellenos.com"
 *             password: "miPassword123"
 *     responses:
 *       200:
 *         description: Login exitoso. Retorna el token JWT y los datos del usuario.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Email o password no proporcionados.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Email y password son requeridos"
 *       401:
 *         description: Credenciales inválidas o usuario inactivo.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Credenciales inválidas"
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', login);
router.post('/registro', registro);
router.post('/aceptar-aviso', autenticar, aceptarAvisoPrivacidad);
router.get('/me', autenticar, getPerfil);

export default router;
