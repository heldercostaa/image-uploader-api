import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import os from 'node:os';
import process from 'node:process';
import { z } from 'zod';

const MEMORY_DEGRADED_THRESHOLD = 0.95; // 95%

function getMemoryUsage() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;

  return {
    used,
    total,
    usagePercent: Number.parseFloat(((used / total) * 100).toFixed(2)),
  };
}

function isDegraded(memoryUsagePercent: number): boolean {
  return memoryUsagePercent >= MEMORY_DEGRADED_THRESHOLD * 100;
}

export const healthCheckController: FastifyPluginAsyncZod = async (server) => {
  server.get(
    '/health-check',
    {
      schema: {
        tags: ['Health Check'],
        response: {
          200: z.object({
            status: z.string(),
            timestamp: z.string().datetime(),
            uptime: z.number(),
            version: z.string(),
            system: z.object({
              platform: z.string(),
              arch: z.string(),
              nodeVersion: z.string(),
              memory: z.object({
                used: z.number(),
                total: z.number(),
                usagePercent: z.number(),
              }),
              cpu: z.object({
                loadAvg: z.tuple([z.number(), z.number(), z.number()]),
                cores: z.number(),
              }),
            }),
          }),
        },
      },
    },
    async (_request, reply) => {
      const memory = getMemoryUsage();

      const body = {
        status: isDegraded(memory.usagePercent) ? 'degraded!' : 'ok!',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version ?? 'unknown',
        system: {
          platform: os.platform(),
          arch: os.arch(),
          nodeVersion: process.version,
          memory,
          cpu: {
            loadAvg: os.loadavg() as [number, number, number],
            cores: os.cpus().length,
          },
        },
      };

      return reply.status(200).send(body);
    }
  );
};
