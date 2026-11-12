import { z } from 'zod';

const contentTypeEnum = z.enum(['article', 'book', 'video', 'podcast']);
const contentStatusEnum = z.enum(['queued', 'in_progress', 'completed', 'dropped']);

export const createContentItemSchema = z.object({
  title: z.string().min(1).max(500),
  url: z.string().url().max(2000).optional(),
  type: contentTypeEnum.optional().default('article'),
  status: contentStatusEnum.optional().default('queued'),
  category: z.string().min(1).max(100).optional().default('General'),
  tags: z.array(z.string().max(50)).optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  notes: z.string().max(50000).optional(),
  source: z.string().max(200).optional(),
  currentPage: z.number().int().min(0).nullable().optional(),
  totalPages: z.number().int().min(1).nullable().optional(),
  isFavorite: z.boolean().optional(),
  collectionId: z.string().uuid().nullable().optional(),
});

export const updateContentItemSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  url: z.string().url().max(2000).nullable().optional(),
  type: contentTypeEnum.optional(),
  status: contentStatusEnum.optional(),
  category: z.string().min(1).max(100).optional(),
  tags: z.array(z.string().max(50)).optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  notes: z.string().max(50000).nullable().optional(),
  source: z.string().max(200).nullable().optional(),
  currentPage: z.number().int().min(0).nullable().optional(),
  totalPages: z.number().int().min(1).nullable().optional(),
  isFavorite: z.boolean().optional(),
  collectionId: z.string().uuid().nullable().optional(),
});

export const contentItemQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'title', 'rating', 'updatedAt', 'completedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  type: contentTypeEnum.optional(),
  status: contentStatusEnum.optional(),
  category: z.string().optional(),
  collectionId: z.string().uuid().optional(),
  isFavorite: z.coerce.boolean().optional(),
  search: z.string().max(200).optional(),
});

export const createCollectionSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().default('#4E85DE'),
});

export const updateCollectionSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const createHighlightSchema = z.object({
  text: z.string().min(1).max(10000),
  note: z.string().max(5000).optional(),
  sortOrder: z.number().int().min(0).optional(),
});
