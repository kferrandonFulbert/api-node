import swaggerJsdoc from 'swagger-jsdoc';

const API_VERSION = process.env.API_VERSION || 'v1';
const API_PREFIX = `/api/${API_VERSION}`;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API documentation',
      version: process.env.npm_package_version || '1.0.0',
      description: 'MVC API documentation blank template'
    },
    servers: [
      { url: API_PREFIX }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;