import dotenv from 'dotenv';
import dbSingleton from './config/db.js';
import Usuario from './models/Usuario.js';

dotenv.config();

async function seed() {
  await dbSingleton.connect();

  const existe = await Usuario.findOne({ email: 'admin@lenios.com' });
  if (existe) {
    console.log('El usuario admin ya existe, no se crea de nuevo.');
    process.exit(0);
  }

  const admin = await Usuario.create({
    nombre: 'Admin Leños',
    email: 'admin@lenios.com',
    password: 'Admin12345', // se hashea solo por el pre('save') del modelo
    rol: 'admin',
  });

  console.log('Usuario admin creado:', admin.email);
  process.exit(0);
}

seed().catch((error) => {
  console.error('Error en seed:', error.message);
  process.exit(1);
});
