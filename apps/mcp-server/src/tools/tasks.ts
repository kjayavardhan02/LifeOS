import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { taskService } from '../services.js';
import { handleServiceError } from '../utils/errors.js';
import { jsonResult } from '../utils/response.js';

export function registerTaskTools(server: McpServer) {
  server.tool(
    'tasks_list',
    'List and filter tasks. Supports filtering by status, priority, category, tags, overdue, My Day, project, date range, and search.',
    {
      status: z.enum(['todo', 'in_progress', 'done', 'cancelled']).optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      isMyDay: z.boolean().optional(),
      isOverdue: z.boolean().optional(),
      projectId: z.string().optional(),
      search: z.string().optional(),
      dueDateFrom: z.string().optional(),
      dueDateTo: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
      sortBy: z.string().default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    },
    async (args) => {
      try {
        return jsonResult(await taskService.list(args));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'tasks_get',
    'Get full details of a task including subtasks and activity log.',
    { id: z.string() },
    async ({ id }) => {
      try {
        return jsonResult(await taskService.getById(id));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'tasks_create',
    'Create a new task. Supports subtasks, recurrence, project linking, and My Day.',
    {
      title: z.string(),
      description: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      status: z.enum(['todo', 'in_progress', 'done', 'cancelled']).optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      dueDate: z.string().optional(),
      notes: z.string().optional(),
      isMyDay: z.boolean().optional(),
      projectId: z.string().optional(),
      isRecurring: z.boolean().optional(),
      recurrencePattern: z.string().optional(),
      recurrenceInterval: z.number().optional(),
      recurrenceDays: z.array(z.string()).optional(),
      recurrenceEndDate: z.string().optional(),
      subtasks: z.array(z.object({ title: z.string() })).optional(),
    },
    async (args) => {
      try {
        return jsonResult(await taskService.create(args));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'tasks_update',
    'Update a task. Setting status to "done" on a recurring task auto-reschedules it.',
    {
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      status: z.enum(['todo', 'in_progress', 'done', 'cancelled']).optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      dueDate: z.string().nullable().optional(),
      notes: z.string().optional(),
      isMyDay: z.boolean().optional(),
      projectId: z.string().nullable().optional(),
    },
    async ({ id, ...data }) => {
      try {
        return jsonResult(await taskService.update(id, data));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'tasks_delete',
    'Soft-delete a task.',
    { id: z.string() },
    async ({ id }) => {
      try {
        await taskService.delete(id);
        return jsonResult({ success: true, message: 'Task deleted' });
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'tasks_add_subtask',
    'Add a subtask to an existing task.',
    { taskId: z.string(), title: z.string() },
    async ({ taskId, title }) => {
      try {
        return jsonResult(await taskService.addSubtask(taskId, { title }));
      } catch (e) { handleServiceError(e); }
    },
  );
}
