import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { eventService } from '../services.js';
import { handleServiceError } from '../utils/errors.js';
import { jsonResult } from '../utils/response.js';

export function registerCalendarTools(server: McpServer) {
  server.tool(
    'calendar_list',
    'List calendar events with optional filters: category, date range, all-day, search.',
    {
      category: z.string().optional(),
      isAllDay: z.boolean().optional(),
      startFrom: z.string().optional(),
      startTo: z.string().optional(),
      search: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
      sortBy: z.string().default('startDate'),
      sortOrder: z.enum(['asc', 'desc']).default('asc'),
    },
    async (args) => {
      try {
        return jsonResult(await eventService.list(args));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'calendar_upcoming',
    'Get upcoming events within the next N days (default 7).',
    { days: z.number().default(7) },
    async ({ days }) => {
      try {
        return jsonResult(await eventService.getUpcoming(days));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'calendar_create',
    'Create a new calendar event with datetime, location, and optional recurrence.',
    {
      title: z.string(),
      description: z.string().optional(),
      startDate: z.string(),
      endDate: z.string(),
      isAllDay: z.boolean().optional(),
      location: z.string().optional(),
      category: z.string().optional(),
      color: z.string().optional(),
      isRecurring: z.boolean().optional(),
      recurrencePattern: z.string().optional(),
      recurrenceInterval: z.number().optional(),
      recurrenceEndDate: z.string().optional(),
    },
    async (args) => {
      try {
        return jsonResult(await eventService.create(args));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'calendar_update',
    'Update an existing calendar event.',
    {
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      isAllDay: z.boolean().optional(),
      location: z.string().optional(),
      category: z.string().optional(),
      color: z.string().optional(),
    },
    async ({ id, ...data }) => {
      try {
        return jsonResult(await eventService.update(id, data));
      } catch (e) { handleServiceError(e); }
    },
  );
}
