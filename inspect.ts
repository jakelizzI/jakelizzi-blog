import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { articles } from "./src/db/schema";
import path from "node:path";

const dbPath = path.resolve(process.cwd(), "local.db");
const client = createClient({ url: `file:${dbPath}` });
const db = drizzle(client);

async function inspect() {
  const allArticles = await db.select().from(articles);
  console.log("Articles:", allArticles.map(a => ({
    id: a.id,
    category: a.category,
    readTime: a.readTime
  })));
  process.exit(0);
}
inspect();
