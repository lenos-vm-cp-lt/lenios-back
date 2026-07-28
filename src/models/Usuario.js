import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true, select: false },
  rol: {
    type: String,
    enum: ['admin', 'editor', 'soporte'],
    default: 'soporte',
  },
  activo: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false });

// Hashea el password antes de guardar
usuarioSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

usuarioSchema.methods.compararPassword = function compararPassword(passwordPlano) {
  return bcrypt.compare(passwordPlano, this.password);
};

export default mongoose.model('Usuario', usuarioSchema);
