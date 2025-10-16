import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    year: z.number(),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),   // /images/...
    demoUrl: z.string().url().optional(),
    repoUrl: z.string().url().optional(),
    featured: z.boolean().default(false),
    order: z.number().optional(),
    draft: z.boolean().default(false),
  }),
})

  const experiences = defineCollection({
  type: "content",
  schema: z.object({
    company: z.string(),
    role: z.string(),
    start: z.string(),
    end: z.string(),
    logo: z.string(),         
    logoBg: z.string().optional(),
    order: z.number().optional(),
    draft: z.boolean().default(false),
  }),
})

export const collections = { projects }

