import { z } from 'zod';

const envSchema = z.object({
  // Api
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  PORT: z.coerce.number().default(3333),

  // Database
  DB_URL: z.string().url().startsWith('postgresql://'),

  // Cloudflare
  CLOUDFLARE_ACCOUNT_ID: z.string(),
  CLOUDFLARE_ACCESS_KEY_ID: z.string(),
  CLOUDFLARE_SECRET_ACCESS_KEY: z.string(),
  CLOUDFLARE_BUCKET: z.string(),
  CLOUDFLARE_PUBLIC_URL: z.string().url(),
});

const _env = envSchema.safeParse(process.env);
if (!_env.success) {
  console.error(
    '❗ Invalid environment variables: ',
    _env.error.flatten().fieldErrors
  );
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
