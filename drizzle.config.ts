import type { Config } from 'drizzle-kit';
import { env } from '@/env';

export default {
  dbCredentials: {
    url: env.DB_URL,
  },
  dialect: 'postgresql',
  schema: 'src/db/schemas/*',
  out: 'src/db/migrations',
} satisfies Config;
