import type { APIRoute } from "astro";
import { articles as articlesTable, categories as categoriesTable, draftArticles } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const POST: APIRoute = async (context) => {
  const db = context.locals.db;
  const formData = await context.request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const id = formData.get("id")?.toString();
    if (id) {
      await db.delete(draftArticles).where(eq(draftArticles.id, id));
      await db.delete(articlesTable).where(eq(articlesTable.id, id));
    }
    return context.redirect("/admin");
  }

  if (intent === "save_draft" || intent === "reflect") {
    const id = formData.get("id")?.toString();
    const slug = formData.get("slug")?.toString() || id;
    const title = formData.get("title")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    
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

    const date = new Date();
    const draftData = {
      id,
      slug,
      title,
      description,
      categoryId,
      readTime,
      content,
      updatedAt: date,
    };

    const existingDraft = await db.select({ id: draftArticles.id })
      .from(draftArticles).where(eq(draftArticles.id, id)).get();

    if (existingDraft) {
      await db.update(draftArticles).set(draftData).where(eq(draftArticles.id, id));
    } else {
      await db.insert(draftArticles).values({ ...draftData, date });
    }

    if (intent === "reflect") {
      const existingArticle = await db.select({ 
          publishedAt: articlesTable.publishedAt,
          status: articlesTable.status 
        })
        .from(articlesTable)
        .where(eq(articlesTable.id, id))
        .get();

      // 公開日は「値が入っていない（null）かつ、初めて反映される時」のみ記録する
      let publishedAt = existingArticle?.publishedAt || null;
      if (!publishedAt) {
        publishedAt = date;
      }

      const articleData = {
        id,
        slug,
        title,
        description,
        categoryId,
        readTime,
        content,
        updatedAt: date,
        publishedAt,
      };

      if (existingArticle) {
        await db.update(articlesTable).set(articleData).where(eq(articlesTable.id, id));
      } else {
        await db.insert(articlesTable).values({ 
          ...articleData, 
          date,
          status: "published"
        });
      }
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
