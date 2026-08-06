import mongoose from 'mongoose';
import util from 'util';
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

class DatabaseSingleton {
  constructor() {
    if (DatabaseSingleton.instance) {
      return DatabaseSingleton.instance;
    }
    this.connection = null;
    DatabaseSingleton.instance = this;
  }

  async connect() {
    if (this.connection) {
      console.log('Usando instancia de conexion existente (Singleton)');
      return this.connection;
    }
    try {
      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        throw new Error('La variable MONGODB_URI no esta configurada en el .env');
      }
      this.connection = await mongoose.connect(mongoUri, {
        family: 4,
      });
      console.log('Conexion exitosa y unica establecida con MongoDB Atlas');
      return this.connection;
    } catch (error) {
      console.error('Error completo al conectar a MongoDB Atlas:');
      console.error(util.inspect(error, { depth: null, colors: true }));
      process.exit(1);
    }
  }
}

export default new DatabaseSingleton();