/// <reference path="../.astro/types.d.ts" />
/// <reference types="auth-astro" />

type D1Database = import("@cloudflare/workers-types").D1Database;

declare namespace App {
  interface Locals {
    db: import("drizzle-orm/libsql").LibSQLDatabase<typeof import("./db/schema")>;
  }
}
