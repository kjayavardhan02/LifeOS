import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { goalService } from '../services.js';
import { handleServiceError } from '../utils/errors.js';
import { jsonResult } from '../utils/response.js';

export function registerGoalTools(server: McpServer) {
  server.tool(
    'goals_list',
    'List goals with filters: status, type, priority, category, search.',
    {
      status: z.enum(['not_started', 'in_progress', 'completed', 'abandoned']).optional(),
      type: z.enum(['outcome', 'habit_based', 'project_based', 'milestone']).optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      category: z.string().optional(),
      search: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
      sortBy: z.string().default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    },
    async (args) => {
      try {
        return jsonResult(await goalService.list(args));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'goals_get',
    'Get full goal details with milestones, linked tasks, and linked habits.',
    { id: z.string() },
    async ({ id }) => {
      try {
        return jsonResult(await goalService.getById(id));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'goals_create',
    'Create a new goal. Progress mode "auto" calculates progress from linked tasks/milestones.',
    {
      title: z.string(),
      description: z.string().optional(),
      type: z.enum(['outcome', 'habit_based', 'project_based', 'milestone']).optional(),
      status: z.enum(['not_started', 'in_progress', 'completed', 'abandoned']).optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      category: z.string().optional(),
      targetDate: z.string().optional(),
      progressMode: z.enum(['auto', 'manual']).optional(),
    },
    async (args) => {
      try {
        return jsonResult(await goalService.create(args));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'goals_update',
    'Update a goal. For manual progress mode, set progress directly (0-100).',
    {
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(['not_started', 'in_progress', 'completed', 'abandoned']).optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      category: z.string().optional(),
      progress: z.number().min(0).max(100).optional(),
    },
    async ({ id, ...data }) => {
      try {
        return jsonResult(await goalService.update(id, data));
      } catch (e) { handleServiceError(e); }
    },
  );
}
