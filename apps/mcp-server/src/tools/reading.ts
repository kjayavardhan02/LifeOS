import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readingService } from '../services.js';
import { handleServiceError } from '../utils/errors.js';
import { jsonResult } from '../utils/response.js';

export function registerReadingTools(server: McpServer) {
  server.tool(
    'reading_list',
    'List reading items. Filter by type (article/book/video/podcast), status, collection, favorites.',
    {
      type: z.enum(['article', 'book', 'video', 'podcast', 'paper', 'course', 'other']).optional(),
      status: z.enum(['want_to_read', 'in_progress', 'completed', 'dropped']).optional(),
      category: z.string().optional(),
      collectionId: z.string().optional(),
      isFavorite: z.boolean().optional(),
      search: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
      sortBy: z.string().default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    },
    async (args) => {
      try {
        return jsonResult(await readingService.listItems(args));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'reading_add',
    'Add an item to the reading list: article, book, video, podcast, paper, or course.',
    {
      title: z.string(),
      type: z.enum(['article', 'book', 'video', 'podcast', 'paper', 'course', 'other']),
      url: z.string().optional(),
      source: z.string().optional(),
      author: z.string().optional(),
      category: z.string().optional(),
      notes: z.string().optional(),
      tags: z.array(z.string()).optional(),
      collectionId: z.string().optional(),
      status: z.enum(['want_to_read', 'in_progress', 'completed', 'dropped']).optional(),
    },
    async (args) => {
      try {
        return jsonResult(await readingService.createItem(args));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'reading_update',
    'Update a reading item: change status, progress (0-100), rating (1-5), favorite, notes.',
    {
      id: z.string(),
      title: z.string().optional(),
      status: z.enum(['want_to_read', 'in_progress', 'completed', 'dropped']).optional(),
      progress: z.number().min(0).max(100).optional(),
      rating: z.number().min(1).max(5).optional(),
      notes: z.string().optional(),
      isFavorite: z.boolean().optional(),
      tags: z.array(z.string()).optional(),
    },
    async ({ id, ...data }) => {
      try {
        return jsonResult(await readingService.updateItem(id, data));
      } catch (e) { handleServiceError(e); }
    },
  );
}
