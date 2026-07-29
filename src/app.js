import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import authRoutes from './routes/auth.routes.js';
import productoRoutes from './routes/producto.routes.js';
import pedidoRoutes from './routes/pedido.routes.js';
import whatsappRoutes from './routes/whatsapp.routes.js';

const app = express();
app.use(express.json());

// ─── Documentación interactiva Swagger UI ───────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Leños Rellenos - API Docs',
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

// ─── Rutas API v1 ────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/productos', productoRoutes);
app.use('/api/v1/pedidos', pedidoRoutes);
app.use('/api/v1/pedidos/whatsapp', whatsappRoutes);

export default app;
