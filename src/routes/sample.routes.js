import { Router } from 'express';
import { getHealthCheck } from '../controllers/sample.controller.js';

const router = Router();

router.get('/health', getHealthCheck);

export default router;
