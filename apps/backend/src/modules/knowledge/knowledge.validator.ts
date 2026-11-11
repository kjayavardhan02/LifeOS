import { z } from 'zod';

export const createQuickNoteSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().max(50000).optional(),
  tags: z.array(z.string().max(50)).max(30).optional(),
  folder: z.string().max(200).optional(),
});

export const updateQuickNoteSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.string().max(50000).nullable().optional(),
  tags: z.array(z.string().max(50)).max(30).optional(),
  folder: z.string().max(200).optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export const knowledgeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'lastModified']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().max(200).optional(),
  folder: z.string().optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  isPinned: z.coerce.boolean().optional(),
  isArchived: z.coerce.boolean().optional(),
  isQuickNote: z.coerce.boolean().optional(),
});

export const createBookmarkSchema = z.object({
  url: z.string().url().max(2000),
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  favicon: z.string().url().max(2000).optional(),
  tags: z.array(z.string().max(50)).max(30).optional(),
});

export const updateBookmarkSchema = z.object({
  url: z.string().url().max(2000).optional(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(2000).nullable().optional(),
  favicon: z.string().url().max(2000).nullable().optional(),
  tags: z.array(z.string().max(50)).max(30).optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export const bookmarkQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().max(200).optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  isPinned: z.coerce.boolean().optional(),
  isArchived: z.coerce.boolean().optional(),
});
