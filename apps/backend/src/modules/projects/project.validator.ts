import { z } from 'zod';

const projectStatusEnum = z.enum(['planning', 'active', 'on_hold', 'completed', 'archived']);
const milestoneStatusEnum = z.enum(['pending', 'in_progress', 'completed']);
const priorityEnum = z.enum(['low', 'medium', 'high', 'urgent']);

export const createProjectSchema = z.object({
  name: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  status: projectStatusEnum.optional(),
  priority: priorityEnum.optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  color: z.string().max(20).optional(),
  startDate: z.string().datetime().optional(),
  targetEndDate: z.string().datetime().optional(),
  notes: z.string().max(50000).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).nullable().optional(),
  status: projectStatusEnum.optional(),
  priority: priorityEnum.optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  color: z.string().max(20).optional(),
  startDate: z.string().datetime().nullable().optional(),
  targetEndDate: z.string().datetime().nullable().optional(),
  notes: z.string().max(50000).nullable().optional(),
});

export const projectQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'status', 'priority', 'targetEndDate']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  status: projectStatusEnum.optional(),
  priority: priorityEnum.optional(),
  category: z.string().optional(),
  search: z.string().max(200).optional(),
});

export const createMilestoneSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  targetDate: z.string().datetime().optional(),
});

export const updateMilestoneSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).nullable().optional(),
  targetDate: z.string().datetime().nullable().optional(),
  status: milestoneStatusEnum.optional(),
});
