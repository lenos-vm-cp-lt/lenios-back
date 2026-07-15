import dotenv from 'dotenv';

dotenv.config();

export const dbConfig = {
  uri: process.env.DB_URI || 'mongodb://localhost:27017/lenios',
};

export const connectDB = async () => {
  try {
    console.log(`[Database] Connecting to: ${dbConfig.uri}`);
    // Aquí se inicializaría la conexión real a la base de datos (ej. mongoose.connect)
  } catch (error) {
    console.error('[Database] Connection error:', error);
    process.exit(1);
  }
};
