/// <reference path="../.astro/types.d.ts" />

type D1Database = import('@cloudflare/workers-types').D1Database;

declare namespace App {
  interface Locals {
    db: import('drizzle-orm/d1').DrizzleD1Database<typeof import('./db/schema')> | import('drizzle-orm/libsql').LibSQLDatabase<typeof import('./db/schema')>;
  }
}
