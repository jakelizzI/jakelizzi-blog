import { defineConfig } from "drizzle-kit";
import { getLocalD1Path } from "./get-local-d1";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: `file:${getLocalD1Path()}`,
  },
});
