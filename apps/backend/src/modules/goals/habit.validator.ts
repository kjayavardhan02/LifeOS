import { z } from 'zod';

const habitFrequencyEnum = z.enum(['daily', 'specific_days', 'weekly', 'monthly']);

export const createHabitSchema = z.object({
  name: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  frequency: habitFrequencyEnum.optional(),
  targetDays: z.array(z.string().max(10)).max(7).optional(),
  targetCount: z.number().int().min(1).max(100).optional(),
  unit: z.string().max(50).optional(),
  category: z.string().max(100).optional(),
  color: z.string().max(20).optional(),
});

export const updateHabitSchema = z.object({
  name: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).nullable().optional(),
  frequency: habitFrequencyEnum.optional(),
  targetDays: z.array(z.string().max(10)).max(7).optional(),
  targetCount: z.number().int().min(1).max(100).optional(),
  unit: z.string().max(50).nullable().optional(),
  category: z.string().max(100).optional(),
  color: z.string().max(20).optional(),
  isArchived: z.boolean().optional(),
});

export const habitQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  category: z.string().optional(),
  isArchived: z.string().optional().transform(v => v === 'true' ? true : v === 'false' ? false : undefined),
  search: z.string().max(200).optional(),
});

export const logHabitSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  value: z.number().int().min(0).max(1000).optional(),
  note: z.string().max(500).optional(),
});

export const habitLogsQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
