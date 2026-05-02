import { defineMiddleware } from "astro:middleware";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleLibSQL } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./db/schema";
import { getSession } from "auth-astro/server";

// キャッシュ用のローカルDBインスタンス
let localDb: ReturnType<typeof drizzleLibSQL> | null = null;

export const onRequest = defineMiddleware(async (context, next) => {
  const env = context.locals.runtime?.env;

  // /admin 以下のアクセスは認証必須（管理者のみ）
  if (context.url.pathname.startsWith('/admin')) {
    const session = await getSession(context.request);
    const adminEmail = import.meta.env.ADMIN_EMAIL || process.env.ADMIN_EMAIL;
    
    if (!session || session.user?.email !== adminEmail) {
      return context.redirect('/login');
    }
  }

  // 本番ビルド(Cloudflare上)かつDBバインディングが存在する場合のみD1を利用
  if (import.meta.env.PROD && env && env.DB) {
    // Cloudflare D1 environment
    context.locals.db = drizzleD1(env.DB, { schema }) as any;
  } else {
    // Local environment using LibSQL (SQLite)
    if (!localDb) {
      const client = createClient({
        url: "file:local.db",
      });
      localDb = drizzleLibSQL(client, { schema });
    }
    context.locals.db = localDb as any;
  }

  return next();
});
