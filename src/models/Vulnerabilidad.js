import mongoose from 'mongoose';

const vulnerabilidadSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ['perdida_destruccion', 'robo_extravio_copia', 'acceso_no_autorizado', 'alteracion_no_autorizada'],
    required: true,
  },
  descripcion: { type: String, required: true },
  fechaOcurrencia: { type: Date, required: true },
  accionesCorrectivas: { type: String, required: true },
  reportadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  estado: { type: String, enum: ['abierta', 'en_atencion', 'resuelta'], default: 'abierta' },
}, { timestamps: true, versionKey: false });

export default mongoose.model('Vulnerabilidad', vulnerabilidadSchema);
