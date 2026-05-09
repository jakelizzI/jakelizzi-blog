// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import auth from "auth-astro";
import { fileURLToPath } from "url";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  integrations: [auth()],
  vite: {
    ssr: {
      noExternal: ["auth-astro"],
    },
    resolve: {
      alias: {
        "auth:config": fileURLToPath(new URL("./auth.config.ts", import.meta.url)),
      },
    },
  },
});
