import { defineMiddleware } from "astro:middleware";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import * as schema from "./db/schema";
import { env } from "cloudflare:workers";
import { auth } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const cfEnv = env;

  // /admin 以下のアクセスは認証必須（管理者のみ）
  if (context.url.pathname.startsWith('/admin')) {
    const session = await auth.api.getSession({
      headers: context.request.headers
    });

    if (!session || session.user?.email !== cfEnv.ADMIN_EMAIL) {
      return context.redirect('/login');
    }
  }

  // DB接続（Astro 6ではローカル・本番ともにD1バインディングを使用）
  context.locals.db = drizzleD1(cfEnv.DB, { schema }) as any;

  return next();
});

