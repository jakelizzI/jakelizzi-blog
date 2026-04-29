import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { articles, categories } from "../src/db/schema";
import { eq } from "drizzle-orm";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const dbPath = path.resolve(process.cwd(), "local.db");
const client = createClient({ url: `file:${dbPath}` });
const db = drizzle(client);

const getCategorySlug = (name: string) => {
  if (name === 'デザイン') return 'design';
  if (name === '執筆') return 'writing';
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
};

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
      
      const date = new Date(data.date);

      const readTimeMatch = typeof data.readTime === 'string' ? data.readTime.match(/\d+/) : null;
      const readTime = readTimeMatch ? parseInt(readTimeMatch[0], 10) : (typeof data.readTime === 'number' ? data.readTime : 0);

      let categoryRecord = await db.select().from(categories).where(eq(categories.name, data.category)).get();
      if (!categoryRecord) {
        const categorySlug = getCategorySlug(data.category);
        const [inserted] = await db.insert(categories).values({
          name: data.category,
          slug: categorySlug
        }).returning();
        categoryRecord = inserted;
      }

      console.log(`Migrating: ${slug} (${data.title})`);

      await db.insert(articles).values({
        id: slug,
        slug,
        title: data.title,
        description: data.description,
        date,
        categoryId: categoryRecord.id,
        readTime,
        content: content,
      }).onConflictDoUpdate({
        target: articles.id,
        set: {
          title: data.title,
          description: data.description,
          date,
          categoryId: categoryRecord.id,
          readTime,
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
