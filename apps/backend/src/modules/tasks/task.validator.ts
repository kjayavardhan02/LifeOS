import { z } from 'zod';

const statusEnum = z.enum(['todo', 'in_progress', 'done', 'cancelled']);
const priorityEnum = z.enum(['low', 'medium', 'high', 'urgent']);
const recurrenceEnum = z.enum(['daily', 'weekly', 'monthly', 'yearly', 'custom']);

export const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  dueDate: z.string().datetime().optional(),
  estimatedMinutes: z.number().int().min(1).max(10080).optional(),
  isMyDay: z.boolean().optional(),
  isRecurring: z.boolean().optional(),
  recurrencePattern: recurrenceEnum.optional(),
  recurrenceInterval: z.number().int().min(1).max(365).optional(),
  recurrenceDays: z.array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])).max(7).optional(),
  recurrenceEndDate: z.string().datetime().optional(),
  notes: z.string().max(10000).optional(),
  projectId: z.string().uuid().optional(),
  subtasks: z.array(z.object({ title: z.string().min(1).max(500) })).max(50).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).nullable().optional(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  estimatedMinutes: z.number().int().min(1).max(10080).nullable().optional(),
  isMyDay: z.boolean().optional(),
  isRecurring: z.boolean().optional(),
  recurrencePattern: recurrenceEnum.nullable().optional(),
  recurrenceInterval: z.number().int().min(1).max(365).nullable().optional(),
  recurrenceDays: z.array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])).max(7).optional(),
  recurrenceEndDate: z.string().datetime().nullable().optional(),
  notes: z.string().max(10000).nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
});

export const taskQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'priority', 'title', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  status: z.union([statusEnum, z.array(statusEnum)]).optional(),
  priority: z.union([priorityEnum, z.array(priorityEnum)]).optional(),
  category: z.string().optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  isMyDay: z.coerce.boolean().optional(),
  isOverdue: z.coerce.boolean().optional(),
  search: z.string().max(200).optional(),
  dueDateFrom: z.string().datetime().optional(),
  dueDateTo: z.string().datetime().optional(),
  projectId: z.string().uuid().optional(),
});

export const createSubtaskSchema = z.object({
  title: z.string().min(1).max(500),
});

export const updateSubtaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  isCompleted: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});
