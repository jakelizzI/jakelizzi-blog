import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { articles } from "../src/db/schema";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const dbPath = path.resolve(process.cwd(), "local.db");
const client = createClient({ url: `file:${dbPath}` });
const db = drizzle(client);

async function seed() {
  const articlesDir = path.resolve(process.cwd(), "src/content/articles");
  
  try {
    const files = await fs.readdir(articlesDir);
    const mdFiles = files.filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
    
    if (mdFiles.length === 0) {
      console.log("No markdown files found to migrate.");
      return;
    }

    console.log(`Found ${mdFiles.length} articles to migrate...`);

    for (const file of mdFiles) {
      const filePath = path.join(articlesDir, file);
      const fileContent = await fs.readFile(filePath, "utf-8");
      
      const { data, content } = matter(fileContent);
      const slug = file.replace(/\.mdx?$/, '');
      
      // Parse date
      const date = new Date(data.date);

      console.log(`Migrating: ${slug} (${data.title})`);

      await db.insert(articles).values({
        id: slug, // using slug as ID
        slug,
        title: data.title,
        description: data.description,
        date,
        category: data.category,
        readTime: data.readTime,
        content: content,
      }).onConflictDoUpdate({
        target: articles.id,
        set: {
          title: data.title,
          description: data.description,
          date,
          category: data.category,
          readTime: data.readTime,
          content: content,
        }
      });
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    process.exit(0);
  }
}

seed();
