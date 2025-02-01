import { env } from "@/env";
import type { Config } from "drizzle-kit";

console.log(env.DB_URL);

export default {
  dbCredentials: {
    url: env.DB_URL,
  },
  dialect: "postgresql",
  schema: "src/db/schemas/*",
  out: "src/db/migrations",
} satisfies Config;
