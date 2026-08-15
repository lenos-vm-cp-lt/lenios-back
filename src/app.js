import express from 'express';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import authRoutes from './routes/auth.routes.js';
import productoRoutes from './routes/producto.routes.js';
import pedidoRoutes from './routes/pedido.routes.js';
import whatsappRoutes from './routes/whatsapp.routes.js';
import vulnerabilidadRoutes from './routes/vulnerabilidad.routes.js';
import arcoRoutes from './routes/arco.routes.js';
import configRoutes from './routes/config.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : [
    'http://localhost:4200',
    'https://lenios-front.vercel.app',
  ];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por política CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Leños Rellenos - API Docs',
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

// ─── Prevención de Inyección NoSQL (Compatible con Express 5) ───────────────
app.use('/api', (req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body, { replaceWith: '_' });
  if (req.params) mongoSanitize.sanitize(req.params, { replaceWith: '_' });
  if (req.query && typeof req.query === 'object') mongoSanitize.sanitize(req.query, { replaceWith: '_' });
  next();
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: 'Demasiadas peticiones (Too Many Requests). Por favor intenta más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vulnerabilidades', vulnerabilidadRoutes);
app.use('/api/v1/productos', productoRoutes);
app.use('/api/v1/pedidos', pedidoRoutes);
app.use('/api/v1/pedidos/whatsapp', whatsappRoutes);
app.use('/api/v1/clientes', arcoRoutes);
app.use('/api/v1/derechos-arco', arcoRoutes);
app.use('/api/v1/config', configRoutes);
app.use('/api/v1/admin/dashboard', adminRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Recurso no encontrado',
  });
});

app.use(errorHandler);

export default app;
