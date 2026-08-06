import mongoose from 'mongoose';

const solicitudArcoSchema = new mongoose.Schema({
  folio: { type: String, default: '' },
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: false },
  nombreCompleto: { type: String, default: '' },
  email: { type: String, default: '' },
  telefono: { type: String, default: '' },
  tipo: {
    type: String,
    enum: ['acceso', 'rectificacion', 'cancelacion', 'oposicion', 'ACCESO', 'RECTIFICACION', 'CANCELACION', 'OPOSICION'],
    required: true,
  },
  estado: {
    type: String,
    enum: ['Pendiente', 'Procesada', 'Rechazada', 'En Proceso', 'pendiente', 'procesada', 'rechazada', 'en_proceso'],
    default: 'Pendiente',
  },
  detalleSolicitud: { type: String, default: '' },
  respuesta: { type: String, default: '' },
}, { timestamps: true, versionKey: false });

export default mongoose.model('SolicitudArco', solicitudArcoSchema);
