const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation EDP',
      version: '1.0.0',
      description: 'Documentación de la API',
    },
  },
  apis: ["./routes/*.js", path.resolve('./login.js')], // Ruta a los archivos que contienen tus rutas
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

///////////////


module.exports = swaggerSpec;
