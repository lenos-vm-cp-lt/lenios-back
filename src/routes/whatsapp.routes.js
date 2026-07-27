import { Router } from 'express';
import { crearMensajeWhatsApp } from '../controllers/whatsapp.controller.js';

const router = Router();

// POST /whatsapp -> Vinculado a crearMensajeWhatsApp
router.post('/', crearMensajeWhatsApp);

export default router;
