import { z } from 'zod';

const captureTypeEnum = z.enum(['task', 'expense', 'note', 'reminder', 'event']);

export const captureInputSchema = z.object({
  input: z.string().min(1, 'Input is required').max(2000),
  type: captureTypeEnum.optional(),
});

export const recentQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
