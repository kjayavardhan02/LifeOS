import { z } from 'zod';

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  module: z
    .enum([
      'tasks',
      'transactions',
      'events',
      'reminders',
      'projects',
      'notes',
      'documents',
      'subscriptions',
    ])
    .optional(),
  sortBy: z.enum(['relevance', 'date']).default('relevance'),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
