import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:workers";
import * as schema from "../db/schema";

// Ensure required environment variables exist
const betterAuthSecret = env.BETTER_AUTH_SECRET || env.AUTH_SECRET;
const betterAuthUrl = env.BETTER_AUTH_URL || env.AUTH_URL;

if (!betterAuthSecret) throw new Error("Missing BETTER_AUTH_SECRET or AUTH_SECRET");
if (!betterAuthUrl) throw new Error("Missing BETTER_AUTH_URL or AUTH_URL");
if (!env.GOOGLE_CLIENT_ID) throw new Error("Missing GOOGLE_CLIENT_ID");
if (!env.GOOGLE_CLIENT_SECRET) throw new Error("Missing GOOGLE_CLIENT_SECRET");

// Fallback to a mock D1 proxy during build time if env.DB is undefined
const dbBinding = env.DB || (new Proxy({}, {
  get: () => () => { throw new Error("DB binding is not available in this context."); }
}) as any);

export const auth = betterAuth({
  database: drizzleAdapter(drizzle(dbBinding, { schema }), {
    provider: "sqlite",
  }),
  secret: betterAuthSecret as string,
  baseURL: betterAuthUrl as string,
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID as string,
      clientSecret: env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
