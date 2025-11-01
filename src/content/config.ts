import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    year: z.number(),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    demoUrl: z.string().optional(),
    repoUrl: z.string().optional(),
    figmaUrl: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().optional(),
    draft: z.boolean().default(false),
  }),
});

const experiences = defineCollection({
  type: 'content',
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
});

const certifications = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    issuer: z.string(),
    issueDate: z.string(),
    expireDate: z.string().optional(),
    credentialId: z.string().optional(),
    credentialUrl: z.string().url().optional(),
    logo: z.string(),
    logoBg: z.string().optional(),
    certificate: z.string().optional(),
    skills: z.array(z.string()).optional(),
    order: z.number().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, experiences, certifications };
