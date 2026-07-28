import mongoose from 'mongoose';

class DatabaseSingleton {
  constructor() {
    if (DatabaseSingleton.instance) {
      // eslint-disable-next-line no-constructor-return
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

      this.connection = await mongoose.connect(mongoUri);
      console.log('Conexion exitosa y unica establecida con MongoDB Atlas');
      return this.connection;
    } catch (error) {
      console.error('Error al conectar a MongoDB Atlas:', error.message);
      process.exit(1);
    }
  }
}

export default new DatabaseSingleton();
