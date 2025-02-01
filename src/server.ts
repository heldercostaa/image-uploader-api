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
import { uploadImageController } from './app/controllers/upload-image';
import { transformSwaggerSchema } from './transform-swagger-schema';

const server = fastify();

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

server.register(uploadImageController);

server.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
  console.log('🚀 Server running!');
});
