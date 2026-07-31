import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import authRoutes from './routes/auth.routes.js';
import productoRoutes from './routes/producto.routes.js';
import pedidoRoutes from './routes/pedido.routes.js';
import whatsappRoutes from './routes/whatsapp.routes.js';
import vulnerabilidadRoutes from './routes/vulnerabilidad.routes.js';
import arcoRoutes from './routes/arco.routes.js';
import configRoutes from './routes/config.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
}));

app.use(express.json());

// ─── Documentación interactiva Swagger UI ─────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Leños Rellenos - API Docs',
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

// ─── Rutas API v1 ──────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vulnerabilidades', vulnerabilidadRoutes);
app.use('/api/v1/productos', productoRoutes);
app.use('/api/v1/pedidos', pedidoRoutes);
app.use('/api/v1/pedidos/whatsapp', whatsappRoutes);
app.use('/api/v1/clientes', arcoRoutes);
app.use('/api/v1/config', configRoutes);

// Manejo de Ruta No Encontrada (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Recurso no encontrado',
  });
});

// Middleware Global de Errores (debe ser el último en registrarse)
app.use(errorHandler);

export default app;
