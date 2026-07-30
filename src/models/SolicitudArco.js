import mongoose from 'mongoose';

const solicitudArcoSchema = new mongoose.Schema({
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  tipo: {
    type: String,
    enum: ['acceso', 'rectificacion', 'cancelacion', 'oposicion'],
    required: true,
  },
  estado: {
    type: String,
    enum: ['procesada', 'rechazada'],
    default: 'procesada',
  },
  detalleSolicitud: { type: String, default: '' },
  respuesta: { type: String, required: true },
}, { timestamps: true, versionKey: false });

export default mongoose.model('SolicitudArco', solicitudArcoSchema);
