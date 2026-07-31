import mongoose from 'mongoose';

const configuracionSchema = new mongoose.Schema({
  abierto: { type: Boolean, required: true, default: true },
  mensaje: { type: String, trim: true, default: '' },
}, { timestamps: true, versionKey: false });

export default mongoose.model('Configuracion', configuracionSchema);
