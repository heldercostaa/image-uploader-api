import pino from "pino";
import { env } from "../env";
import { trace } from "@opentelemetry/api";

const level = env.LOG_LEVEL;

export const logger = pino({
  level,
  mixin() {
    const span = trace.getActiveSpan();
    if (!span) return {};

    const { traceId, spanId, traceFlags } = span.spanContext();
    return { traceId, spanId, traceFlags };
  },
  transport: {
    targets: [
      {
        target: 'pino-opentelemetry-transport',
        level,
        options: {
          resourceAttributes: {
            'service.name': 'image-uploader-api',
          },
        },
      },
      {
        target: "pino-pretty",
        level,
        options: {
          levelFirst: true,
          colorize: true,
          include: 'level,time',
          translateTime: 'yyyy-mm-dd HH:MM:ss Z'
        },
      },
  ]},
});
