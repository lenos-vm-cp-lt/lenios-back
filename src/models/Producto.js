import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, trim: true },
  precio: { type: Number, required: true, min: 0 },
  imagen: { type: String, default: '' },
  categoria: { type: String, required: true, trim: true },
  disponible: { type: Boolean, default: true },
  stock: {
    type: Number, required: true, min: 0, default: 0,
  },
}, { timestamps: true, versionKey: false });

export default mongoose.model('Producto', productoSchema);
