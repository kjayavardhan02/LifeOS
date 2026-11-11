import { z } from 'zod';

const categoryTypes = ['expense', 'income', 'task', 'event', 'reminder', 'subscription'] as const;

export const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(categoryTypes),
});

export const queryTypeSchema = z.object({
  type: z.enum(categoryTypes).optional(),
});
