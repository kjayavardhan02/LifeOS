import { z } from 'zod';

const goalStatusEnum = z.enum(['not_started', 'in_progress', 'completed', 'abandoned']);
const goalTypeEnum = z.enum(['short_term', 'long_term']);
const priorityEnum = z.enum(['low', 'medium', 'high', 'urgent']);
const milestoneStatusEnum = z.enum(['pending', 'in_progress', 'completed']);

export const createGoalSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(10000).optional(),
  type: goalTypeEnum.optional(),
  status: goalStatusEnum.optional(),
  priority: priorityEnum.optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  targetDate: z.string().datetime().optional(),
  progress: z.number().int().min(0).max(100).optional(),
  progressMode: z.enum(['auto', 'manual']).optional(),
  notes: z.string().max(50000).optional(),
  projectId: z.string().uuid().optional(),
});

export const updateGoalSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(10000).nullable().optional(),
  type: goalTypeEnum.optional(),
  status: goalStatusEnum.optional(),
  priority: priorityEnum.optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  targetDate: z.string().datetime().nullable().optional(),
  progress: z.number().int().min(0).max(100).optional(),
  progressMode: z.enum(['auto', 'manual']).optional(),
  notes: z.string().max(50000).nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
});

export const goalQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'status', 'priority', 'targetDate']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  status: goalStatusEnum.optional(),
  type: goalTypeEnum.optional(),
  priority: priorityEnum.optional(),
  category: z.string().optional(),
  search: z.string().max(200).optional(),
});

export const createGoalMilestoneSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  targetDate: z.string().datetime().optional(),
});

export const updateGoalMilestoneSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).nullable().optional(),
  targetDate: z.string().datetime().nullable().optional(),
  status: milestoneStatusEnum.optional(),
});
