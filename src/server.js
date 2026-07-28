import dotenv from 'dotenv';
import app from './app.js';
import dbSingleton from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  await dbSingleton.connect();
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

startServer();
