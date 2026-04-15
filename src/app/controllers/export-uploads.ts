import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { unwrapEither } from '@/shared/either';
import { exportUploadsService } from '../services/export-uploads';

export const exportUploadsController: FastifyPluginAsyncZod = async (server) => {
  server.post(
    '/uploads/export',
    {
      schema: {
        summary: 'Export uploads',
        tags: ['Uploads'],
        querystring: z.object({
          searchQuery: z.string().optional(),
        }),
        response: {
          200: z.object({
            reportUrl: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { searchQuery } = request.query;

      const result = await exportUploadsService({
        searchQuery,
      });

      const { reportUrl } = unwrapEither(result);

      return reply.status(200).send({ reportUrl });
    }
  );
};
