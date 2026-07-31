import mongoose from 'mongoose';

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  telefono: { type: String, required: true, trim: true },
  ubicacion: { type: String, required: true, trim: true },
  bloqueado: { type: Boolean, default: false },
  anonimizado: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

export default mongoose.model('Cliente', clienteSchema);
