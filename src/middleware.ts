import { defineMiddleware } from 'astro:middleware';
import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { drizzle as drizzleLibSQL } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './db/schema';

// キャッシュ用のローカルDBインスタンス
let localDb: ReturnType<typeof drizzleLibSQL> | null = null;

export const onRequest = defineMiddleware((context, next) => {
  const env = context.locals.runtime?.env;

  // 本番ビルド(Cloudflare上)かつDBバインディングが存在する場合のみD1を利用
  if (import.meta.env.PROD && env && env.DB) {
    // Cloudflare D1 environment
    context.locals.db = drizzleD1(env.DB, { schema });
  } else {
    // Local environment using LibSQL (SQLite)
    if (!localDb) {
      const client = createClient({
        url: 'file:local.db',
      });
      localDb = drizzleLibSQL(client, { schema });
    }
    context.locals.db = localDb;
  }

  return next();
});
