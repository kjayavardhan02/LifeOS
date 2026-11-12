import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { projectService } from '../services.js';
import { handleServiceError } from '../utils/errors.js';
import { jsonResult } from '../utils/response.js';

export function registerProjectTools(server: McpServer) {
  server.tool(
    'projects_list',
    'List projects with filters: status, priority, category, search. Includes task completion stats.',
    {
      status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).optional(),
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
        return jsonResult(await projectService.list(args));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'projects_get',
    'Get full project details including milestones and tasks.',
    { id: z.string() },
    async ({ id }) => {
      try {
        return jsonResult(await projectService.getById(id));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'projects_create',
    'Create a new project with metadata, dates, and category.',
    {
      name: z.string(),
      description: z.string().optional(),
      status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      category: z.string().optional(),
      startDate: z.string().optional(),
      targetEndDate: z.string().optional(),
      notes: z.string().optional(),
      tags: z.array(z.string()).optional(),
    },
    async (args) => {
      try {
        return jsonResult(await projectService.create(args));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'projects_update',
    'Update a project.',
    {
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      category: z.string().optional(),
      startDate: z.string().nullable().optional(),
      targetEndDate: z.string().nullable().optional(),
      notes: z.string().optional(),
      tags: z.array(z.string()).optional(),
    },
    async ({ id, ...data }) => {
      try {
        return jsonResult(await projectService.update(id, data));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'projects_add_milestone',
    'Add a milestone to a project.',
    {
      projectId: z.string(),
      title: z.string(),
      description: z.string().optional(),
      targetDate: z.string().optional(),
    },
    async ({ projectId, ...data }) => {
      try {
        return jsonResult(await projectService.addMilestone(projectId, data));
      } catch (e) { handleServiceError(e); }
    },
  );
}
