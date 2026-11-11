import { z } from 'zod';

const priorityEnum = z.enum(['low', 'medium', 'high', 'urgent']);
const reminderStatusEnum = z.enum(['pending', 'snoozed', 'done', 'dismissed']);
const recurrenceEnum = z.enum(['daily', 'weekly', 'monthly', 'yearly', 'custom']);

export const createReminderSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  dueDate: z.string().datetime(),
  priority: priorityEnum.optional(),
  category: z.string().max(100).optional(),
  isRecurring: z.boolean().optional(),
  recurrencePattern: recurrenceEnum.optional(),
  recurrenceEndDate: z.string().datetime().optional(),
  linkedModule: z.string().max(50).optional(),
  linkedItemId: z.string().uuid().optional(),
  notifyEmail: z.boolean().optional(),
  notifyBrowser: z.boolean().optional(),
});

export const updateReminderSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).nullable().optional(),
  dueDate: z.string().datetime().optional(),
  priority: priorityEnum.optional(),
  category: z.string().max(100).optional(),
  status: reminderStatusEnum.optional(),
  isRecurring: z.boolean().optional(),
  recurrencePattern: recurrenceEnum.nullable().optional(),
  recurrenceEndDate: z.string().datetime().nullable().optional(),
  snoozedUntil: z.string().datetime().nullable().optional(),
  linkedModule: z.string().max(50).nullable().optional(),
  linkedItemId: z.string().uuid().nullable().optional(),
  notifyEmail: z.boolean().optional(),
  notifyBrowser: z.boolean().optional(),
});

export const reminderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['dueDate', 'createdAt', 'priority', 'title', 'status']).default('dueDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  status: z.union([reminderStatusEnum, z.array(reminderStatusEnum)]).optional(),
  priority: z.union([priorityEnum, z.array(priorityEnum)]).optional(),
  category: z.string().optional(),
  search: z.string().max(200).optional(),
  dueDateFrom: z.string().datetime().optional(),
  dueDateTo: z.string().datetime().optional(),
  isOverdue: z.coerce.boolean().optional(),
  linkedModule: z.string().optional(),
});

export const snoozeReminderSchema = z.object({
  minutes: z.number().int().min(1).max(10080),
});
