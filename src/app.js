import express from 'express';
import Producto from './models/Producto.js';
import Pedido from './models/Pedido.js';
import authRoutes from './routes/auth.routes.js';
import { autenticar } from './middlewares/auth.middleware.js';
import { autorizar } from './middlewares/roles.middleware.js';
import whatsappRoutes from './routes/whatsapp.routes.js';
import { registrarAuditoria } from './utils/auditLog.js';
import vulnerabilidadRoutes from './routes/vulnerabilidad.routes.js';

const app = express();
app.use(express.json());

app.use('/api/v1/auth', authRoutes);

app.use('/api/v1/vulnerabilidades', vulnerabilidadRoutes);

app.get('/api/v1/productos', async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/productos', autenticar, autorizar('admin', 'editor'), async (req, res) => {
  try {
    const nuevoProducto = await Producto.create(req.body);
    registrarAuditoria({
      accion: 'CREAR_PRODUCTO',
      usuarioId: req.usuario.id,
      recurso: 'Producto',
      // eslint-disable-next-line no-underscore-dangle
      recursoId: nuevoProducto._id,
      resultado: 'exito',
    });
    res.status(201).json(nuevoProducto);
  } catch (error) {
    registrarAuditoria({
      accion: 'CREAR_PRODUCTO',
      usuarioId: req.usuario.id,
      recurso: 'Producto',
      resultado: 'fallo',
    });
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/v1/pedidos', async (req, res) => {
  try {
    const pedidos = await Pedido.find();
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/pedidos', async (req, res) => {
  try {
    const nuevoPedido = await Pedido.create(req.body);
    registrarAuditoria({
      accion: 'CREAR_PEDIDO',
      usuarioId: 'cliente_publico',
      recurso: 'Pedido',
      // eslint-disable-next-line no-underscore-dangle
      recursoId: nuevoPedido._id,
      resultado: 'exito',
    });
    res.status(201).json(nuevoPedido);
  } catch (error) {
    registrarAuditoria({
      accion: 'CREAR_PEDIDO',
      usuarioId: 'cliente_publico',
      recurso: 'Pedido',
      resultado: 'fallo',
    });
    res.status(400).json({ error: error.message });
  }
});

app.use('/api/v1/pedidos/whatsapp', whatsappRoutes);

export default app;
