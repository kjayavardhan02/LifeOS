import { z } from 'zod';

const recurrenceEnum = z.enum(['daily', 'weekly', 'monthly', 'yearly', 'custom']);

export const createEventSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  location: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  color: z.string().max(20).optional(),
  isAllDay: z.boolean().optional(),
  isRecurring: z.boolean().optional(),
  recurrencePattern: recurrenceEnum.optional(),
  recurrenceEndDate: z.string().datetime().optional(),
  reminderMinutes: z.number().int().min(0).max(10080).optional(),
});

export const updateEventSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).nullable().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  location: z.string().max(500).nullable().optional(),
  category: z.string().max(100).optional(),
  color: z.string().max(20).optional(),
  isAllDay: z.boolean().optional(),
  isRecurring: z.boolean().optional(),
  recurrencePattern: recurrenceEnum.nullable().optional(),
  recurrenceEndDate: z.string().datetime().nullable().optional(),
  reminderMinutes: z.number().int().min(0).max(10080).nullable().optional(),
});

export const eventQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  sortBy: z.enum(['startDate', 'createdAt', 'title', 'category']).default('startDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  category: z.string().optional(),
  startFrom: z.string().datetime().optional(),
  startTo: z.string().datetime().optional(),
  isAllDay: z.coerce.boolean().optional(),
  search: z.string().max(200).optional(),
});
