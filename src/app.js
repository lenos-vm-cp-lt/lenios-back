import express from 'express';
import Producto from './models/Producto.js';
import Pedido from './models/Pedido.js';
import whatsappRoutes from './routes/whatsapp.routes.js';

const app = express();
app.use(express.json());

app.get('/api/v1/productos', async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/productos', async (req, res) => {
  try {
    const nuevoProducto = await Producto.create(req.body);
    res.status(201).json(nuevoProducto);
  } catch (error) {
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
    res.status(201).json(nuevoPedido);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.use('/api/v1/pedidos/whatsapp', whatsappRoutes);

export default app;