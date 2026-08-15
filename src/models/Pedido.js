import mongoose from 'mongoose';

const productoSolicitadoSchema = new mongoose.Schema({
  id_producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  nombre: { type: String, required: true },
  cantidad: { type: Number, required: true, min: 1 },
  precio_unitario: { type: Number, required: true, min: 0 },
}, { _id: false });

const pedidoSchema = new mongoose.Schema({
  cliente: {
    nombre: { type: String, required: true },
    telefono: { type: String, required: true },
    ubicacion: { type: String, required: true },
  },
  productos_solicitados: [productoSolicitadoSchema],
  total: { type: Number, required: true, min: 0 },
  estado: { type: String, enum: ['Pendiente', 'En preparacion', 'En camino', 'Entregado', 'Cancelado'], default: 'Pendiente' },
  pago_recibido: { type: Boolean, default: false },
  estado_pago: { type: String, enum: ['Pendiente', 'Pagado', 'Rechazado'], default: 'Pendiente' },
  metodo_envio: { type: String, default: 'A domicilio' },
  metodo_entrega: { type: String, default: 'A domicilio' },
  metodo_pago: { type: String, default: 'Efectivo' },
  notas: { type: String, default: '' },
  observaciones: { type: String, default: '' },
}, { timestamps: true, versionKey: false });

export default mongoose.model('Pedido', pedidoSchema);
