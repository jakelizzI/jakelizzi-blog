import type { APIRoute } from "astro";
import { articles as articlesTable, categories as categoriesTable } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const POST: APIRoute = async (context) => {
  const db = context.locals.db;
  const formData = await context.request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const id = formData.get("id")?.toString();
    if (id) {
      await db.delete(articlesTable).where(eq(articlesTable.id, id));
    }
    return context.redirect("/admin");
  }

  if (intent === "create" || intent === "update") {
    const id = formData.get("id")?.toString();
    const slug = formData.get("slug")?.toString() || id;
    const title = formData.get("title")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const status = formData.get("status")?.toString() || "draft";
    
    const newCategoryName = formData.get("newCategoryName")?.toString() || "";
    const newCategorySlug = formData.get("newCategorySlug")?.toString() || "";
    let categoryId = parseInt(formData.get("categoryId")?.toString() || "", 10);

    // 新規カテゴリ作成の判定
    if (newCategoryName && newCategorySlug) {
      const [inserted] = await db.insert(categoriesTable).values({
        name: newCategoryName,
        slug: newCategorySlug,
      }).returning();
      categoryId = inserted.id;
    }

    const readTimeStr = formData.get("readTime")?.toString() || "0";
    const readTime = parseInt(readTimeStr, 10);
    const content = formData.get("content")?.toString() || "";

    if (!id || !slug || !title || isNaN(categoryId)) {
      return new Response("Missing required fields", { status: 400 });
    }

    if (intent === "create") {
      const date = new Date();
      await db.insert(articlesTable).values({
        id,
        slug,
        title,
        description,
        categoryId,
        readTime,
        status,
        content,
        date,
      });
    } else {
      await db.update(articlesTable).set({
        slug,
        title,
        description,
        categoryId,
        readTime,
        status,
        content,
      }).where(eq(articlesTable.id, id));
    }
    if (formData.get("isAjax") === "true") {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    return context.redirect("/admin");
  }

  return new Response("Invalid intent", { status: 400 });
};
