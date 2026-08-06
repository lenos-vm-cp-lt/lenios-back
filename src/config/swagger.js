import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Leños Rellenos - API Documentation',
      version: '1.0.0',
      description:
        'Documentación interactiva de la API REST para el sistema de pedidos de Leños Rellenos.',
    },
    servers: [
      {
        url: 'https://lenios-back.onrender.com/api/v1',
        description: 'Servidor de producción (Render)',
      },
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Servidor de desarrollo local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'Introduce el token JWT obtenido en /auth/login con el prefijo Bearer. Ejemplo: "Bearer eyJhbGci..."',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;