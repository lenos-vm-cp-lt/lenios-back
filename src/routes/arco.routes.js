import { Router } from 'express';
import {
  solicitarAcceso, solicitarRectificacion, solicitarBloqueo, solicitarCancelacion,
} from '../controllers/arco.controller.js';

const router = Router();

router.post('/:id/arco/acceso', solicitarAcceso);
router.patch('/:id/arco/rectificacion', solicitarRectificacion);
router.post('/:id/arco/bloqueo', solicitarBloqueo);
router.post('/:id/arco/cancelacion', solicitarCancelacion);

export default router;
