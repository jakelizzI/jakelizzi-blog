import { defineCollection, z } from "astro:content";

const articles = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    category: z.enum(["デザイン", "執筆"]),
    readTime: z.string(),
  }),
});

export const collections = {
  articles,
};
