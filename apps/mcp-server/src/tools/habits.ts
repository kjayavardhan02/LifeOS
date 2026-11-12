import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { habitService } from '../services.js';
import { handleServiceError } from '../utils/errors.js';
import { jsonResult } from '../utils/response.js';

export function registerHabitTools(server: McpServer) {
  server.tool(
    'habits_list',
    'List habits with today\'s completion status. Filter by category, archived, search.',
    {
      category: z.string().optional(),
      isArchived: z.boolean().optional(),
      search: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    },
    async (args) => {
      try {
        return jsonResult(await habitService.list(args));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'habits_create',
    'Create a new habit with frequency (daily or specific days) and target value.',
    {
      name: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      color: z.string().optional(),
      icon: z.string().optional(),
      frequency: z.enum(['daily', 'specific_days']).optional(),
      targetDays: z.array(z.string()).optional(),
      targetValue: z.number().optional(),
      unit: z.string().optional(),
    },
    async (args) => {
      try {
        return jsonResult(await habitService.create(args));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'habits_log',
    'Log a habit completion for a specific date (YYYY-MM-DD). Auto-recalculates streaks. Value=0 removes the log.',
    {
      habitId: z.string(),
      date: z.string(),
      value: z.number().optional(),
      note: z.string().optional(),
    },
    async ({ habitId, ...data }) => {
      try {
        const result = await habitService.logCompletion(habitId, data);
        return jsonResult(result ?? { success: true, message: 'Log removed' });
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'habits_today',
    'Get today\'s habit checklist: which habits are scheduled and their completion status.',
    {},
    async () => {
      try {
        return jsonResult(await habitService.getTodayChecklist());
      } catch (e) { handleServiceError(e); }
    },
  );
}
