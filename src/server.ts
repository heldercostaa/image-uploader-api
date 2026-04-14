import { env } from '@/env';
import { fastifyCors } from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { fastify } from 'fastify';
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import { exportUploadsController } from './app/controllers/export-uploads';
import { getUploadsController } from './app/controllers/get-uploads';
import { healthCheckController } from './app/controllers/health-check';
import { uploadImageController } from './app/controllers/upload-image';
import { logger } from './infra/logger';
import { transformSwaggerSchema } from './transform-swagger-schema';

const server = fastify();

server.addHook("preHandler", async (request, reply) => {
  logger.trace(`[${request.method}] ${request.url}`);
});

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.setErrorHandler((error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: 'Validation error',
      errors: error.validation,
    });
  }

  // TODO: Send error to Sentry or other error tracking service
  console.error(error);

  return reply.status(500).send({ message: 'Internal server error.' });
});

server.register(fastifyCors, { origin: '*' });

server.register(fastifyMultipart);
server.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Image Uploader',
      version: '1.0.0',
    },
  },
  transform: transformSwaggerSchema,
});

server.register(fastifySwaggerUi, {
  routePrefix: '/docs',
});

server.register(healthCheckController);
server.register(uploadImageController);
server.register(getUploadsController);
server.register(exportUploadsController);

server.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
  logger.info('🚀 Server running!')
});
