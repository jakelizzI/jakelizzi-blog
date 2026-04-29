import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const articles = sqliteTable('articles', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  category: text('category').notNull(),
  readTime: text('read_time').notNull(),
  content: text('content').notNull(),
});
