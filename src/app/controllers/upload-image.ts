import { isRight, unwrapEither } from '@/shared/either';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { uploadImageService } from '../services/upload-image';

const MAXIMUM_FILE_SIZE_IN_BYTES = 1024 * 1024 * 4;

export const uploadImageController: FastifyPluginAsyncZod = async (server) => {
  server.post(
    '/uploads',
    {
      schema: {
        summary: 'Upload an image',
        tags: ['Uploads'],
        consumes: ['multipart/form-data'],
        response: {
          201: z.object({ url: z.string() }).describe('Image uploaded successfully.'),
          400: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const uploadedFile = await request.file({
        limits: { fileSize: MAXIMUM_FILE_SIZE_IN_BYTES }, // 4MB
      });

      if (!uploadedFile) {
        return reply.status(400).send({
          message: 'File is required',
        });
      }

      const result = await uploadImageService({
        fileName: uploadedFile.filename,
        contentType: uploadedFile.mimetype,
        contentStream: uploadedFile.file,
      });

      if (uploadedFile.file.truncated) {
        return reply.status(400).send({
          message: 'File is too large',
        });
      }

      if (isRight(result)) {
        const { url } = unwrapEither(result);
        return reply.status(201).send({ url });
      }

      const error = unwrapEither(result);

      switch (error.constructor.name) {
        case 'InvalidFileFormat':
          return reply.status(400).send({ message: error.message });
      }
    }
  );
};
