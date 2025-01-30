import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  DB_URL: z.string().url().startsWith("postgresql://"),
  PORT: z.coerce.number().default(3333),
});

const _env = envSchema.safeParse(process.env);
if (!_env.success) {
  console.error(
    "❗ Invalid environment variables: ",
    _env.error.flatten().fieldErrors
  );
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
