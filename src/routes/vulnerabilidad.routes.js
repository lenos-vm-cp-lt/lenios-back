import { Router } from 'express';
import { autenticar } from '../middlewares/auth.middleware.js';
import { autorizar } from '../middlewares/roles.middleware.js';
import { registrarVulnerabilidad, listarVulnerabilidades } from '../controllers/vulnerabilidad.controller.js';

const router = Router();

router.post('/', autenticar, autorizar('admin'), registrarVulnerabilidad);
router.get('/', autenticar, autorizar('admin'), listarVulnerabilidades);

export default router;
