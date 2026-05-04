import { defineMiddleware } from "astro:middleware";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleLibSQL } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./db/schema";
import { getSession } from "auth-astro/server";

// キャッシュ用のローカルDBインスタンス
let localDb: ReturnType<typeof drizzleLibSQL> | null = null;

// Cloudflare環境変数の取得ヘルパー
function getCloudflareEnv() {
  try {
    // cloudflare:workers はCloudflareランタイムでのみ利用可能
    const { env } = require("cloudflare:workers");
    return env;
  } catch {
    return null;
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  const cfEnv = getCloudflareEnv();

  // /admin 以下のアクセスは認証必須（管理者のみ）
  if (context.url.pathname.startsWith('/admin')) {
    const session = await getSession(context.request);
    const adminEmail = cfEnv?.ADMIN_EMAIL ?? process.env.ADMIN_EMAIL;
    
    if (!session || session.user?.email !== adminEmail) {
      return context.redirect('/login');
    }
  }

  // 本番ビルド(Cloudflare上)かつDBバインディングが存在する場合のみD1を利用
  if (import.meta.env.PROD && cfEnv?.DB) {
    // Cloudflare D1 environment
    context.locals.db = drizzleD1(cfEnv.DB, { schema }) as any;
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

