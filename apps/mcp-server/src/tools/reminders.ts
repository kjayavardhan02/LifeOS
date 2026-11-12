import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { reminderService } from '../services.js';
import { handleServiceError } from '../utils/errors.js';
import { jsonResult } from '../utils/response.js';

export function registerReminderTools(server: McpServer) {
  server.tool(
    'reminders_list',
    'List reminders with filters: status, priority, overdue, linked module, date range.',
    {
      status: z.enum(['pending', 'snoozed', 'done', 'dismissed']).optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      category: z.string().optional(),
      linkedModule: z.string().optional(),
      isOverdue: z.boolean().optional(),
      search: z.string().optional(),
      dueDateFrom: z.string().optional(),
      dueDateTo: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
      sortBy: z.string().default('dueDate'),
      sortOrder: z.enum(['asc', 'desc']).default('asc'),
    },
    async (args) => {
      try {
        return jsonResult(await reminderService.list(args));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'reminders_create',
    'Create a new reminder with due date, priority, and optional module link.',
    {
      title: z.string(),
      description: z.string().optional(),
      dueDate: z.string(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      category: z.string().optional(),
      linkedModule: z.string().optional(),
      linkedItemId: z.string().optional(),
      isRecurring: z.boolean().optional(),
      recurrencePattern: z.string().optional(),
      recurrenceInterval: z.number().optional(),
      recurrenceEndDate: z.string().optional(),
    },
    async (args) => {
      try {
        return jsonResult(await reminderService.create(args));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'reminders_update',
    'Update a reminder. Set status to "done" or "dismissed" to complete/dismiss it.',
    {
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      dueDate: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      status: z.enum(['pending', 'snoozed', 'done', 'dismissed']).optional(),
    },
    async ({ id, ...data }) => {
      try {
        return jsonResult(await reminderService.update(id, data));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'reminders_snooze',
    'Snooze a reminder for N minutes (default 30).',
    { id: z.string(), minutes: z.number().default(30) },
    async ({ id, minutes }) => {
      try {
        return jsonResult(await reminderService.snooze(id, minutes));
      } catch (e) { handleServiceError(e); }
    },
  );
}
