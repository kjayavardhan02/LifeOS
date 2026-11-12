import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { searchService } from '../services.js';
import { handleServiceError } from '../utils/errors.js';
import { jsonResult } from '../utils/response.js';

export function registerSearchTools(server: McpServer) {
  server.tool(
    'global_search',
    'Search across all LifeOS modules: tasks, transactions, events, reminders, projects, notes, documents, subscriptions. Returns grouped results.',
    {
      q: z.string().describe('Search query'),
      module: z.enum(['tasks', 'transactions', 'events', 'reminders', 'projects', 'notes', 'documents', 'subscriptions']).optional().describe('Limit search to a specific module'),
      sortBy: z.enum(['relevance', 'date']).default('relevance'),
      limit: z.number().default(5),
    },
    async (args) => {
      try {
        return jsonResult(await searchService.search(args));
      } catch (e) { handleServiceError(e); }
    },
  );
}
