import { z } from 'zod';

const storageTypeEnum = z.enum(['local', 'external']);

export const createDocumentSchema = z.object({
  name: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  category: z.string().max(100).optional(),
  folder: z.string().max(500).optional(),
  tags: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return val ? val.split(',').map((s: string) => s.trim()) : []; }
      }
      return val;
    },
    z.array(z.string().max(50)).max(20).optional(),
  ),
  documentNumber: z.string().max(200).optional(),
  issuer: z.string().max(500).optional(),
  issueDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
  notes: z.string().max(10000).optional(),
  storageType: storageTypeEnum.optional(),
  externalUrl: z.string().url().max(2000).optional(),
});

export const updateDocumentSchema = z.object({
  name: z.string().min(1).max(500).optional(),
  description: z.string().max(2000).nullable().optional(),
  category: z.string().max(100).optional(),
  folder: z.string().max(500).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  documentNumber: z.string().max(200).nullable().optional(),
  issuer: z.string().max(500).nullable().optional(),
  issueDate: z.string().datetime().nullable().optional(),
  expiryDate: z.string().datetime().nullable().optional(),
  notes: z.string().max(10000).nullable().optional(),
  externalUrl: z.string().url().max(2000).nullable().optional(),
});

export const documentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'expiryDate', 'category']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  category: z.string().optional(),
  folder: z.string().optional(),
  storageType: storageTypeEnum.optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  search: z.string().max(200).optional(),
  expiryStatus: z.enum(['all', 'expiring_soon', 'expired']).optional(),
  expiryDateFrom: z.string().datetime().optional(),
  expiryDateTo: z.string().datetime().optional(),
});

export const expiringQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});
