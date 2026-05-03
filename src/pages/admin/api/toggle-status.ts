import type { APIRoute } from "astro";
import { articles as articlesTable } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const POST: APIRoute = async (context) => {
  const db = context.locals.db;
  const formData = await context.request.formData();
  const id = formData.get("id")?.toString();
  const status = formData.get("status")?.toString();

  if (!id || (status !== "published" && status !== "private")) {
    return new Response(JSON.stringify({ error: "Invalid parameters" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  // articles テーブルに存在するか確認（未公開の場合はエラー）
  const existing = await db.select({ id: articlesTable.id }).from(articlesTable).where(eq(articlesTable.id, id)).get();
  
  if (!existing) {
    return new Response(JSON.stringify({ error: "Article is not published yet" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  await db.update(articlesTable).set({ status }).where(eq(articlesTable.id, id));

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
