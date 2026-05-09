import { defineMiddleware } from "astro:middleware";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleLibSQL } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./db/schema";
import { getSession } from "auth-astro/server";

// LibSQL フォールバック用のキャッシュ
let localDb: ReturnType<typeof drizzleLibSQL> | null = null;

/**
 * 環境変数・バインディングを取得する
 * 本番: cloudflare:workers の env
 * ローカル: platformProxy 経由の locals.runtime.env + .dev.vars
 */
async function getEnv(context: any): Promise<any> {
  if (import.meta.env.PROD) {
    const { env } = await import("cloudflare:workers");
    return env;
  }
  // ローカル開発: platformProxy が locals.runtime.env に .dev.vars + wrangler.json の vars を提供
  return (context.locals as any).runtime?.env ?? {};
}

export const onRequest = defineMiddleware(async (context, next) => {
  const cfEnv = await getEnv(context);

  // /admin 以下のアクセスは認証必須（管理者のみ）
  if (context.url.pathname.startsWith('/admin')) {
    const session = await getSession(context.request);

    if (!session || session.user?.email !== cfEnv.ADMIN_EMAIL) {
      return context.redirect('/login');
    }
  }

  // DB接続（D1バインディング優先、フォールバックでLibSQL）
  if (import.meta.env.PROD) {
    context.locals.db = drizzleD1(cfEnv.DB, { schema }) as any;
  } else {
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

