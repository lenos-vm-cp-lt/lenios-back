import mongoose from 'mongoose';

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  telefono: { type: String, required: true, trim: true },
  ubicacion: { type: String, required: true, trim: true },
}, { timestamps: true, versionKey: false });

export default mongoose.model('Cliente', clienteSchema);
