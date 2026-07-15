import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import sampleRouter from './routes/sample.routes.js';

const app = express();

// Middlewares globales
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Modular Routes
app.use('/api', sampleRouter);

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Resource not found',
  });
});

export default app;
//
