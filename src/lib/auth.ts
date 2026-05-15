import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:workers";
import * as schema from "../db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(drizzle(env.DB as any, { schema }), {
    provider: "sqlite",
  }),
  secret: (env.BETTER_AUTH_SECRET || env.AUTH_SECRET) as string,
  baseURL: (env.BETTER_AUTH_URL || env.AUTH_URL) as string,
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID as string,
      clientSecret: env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
