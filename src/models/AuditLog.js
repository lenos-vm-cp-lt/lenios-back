import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  usuarioId: { type: String, required: true },
  accion: { type: String, required: true },
  entidad: { type: String, required: true },
  entidadId: { type: String },
  resultado: { type: String, default: 'exito' },
  ip: { type: String },
}, { timestamps: true, versionKey: false });

export default mongoose.model('AuditLog', auditLogSchema);
