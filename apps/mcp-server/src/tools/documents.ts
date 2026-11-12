import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { documentService } from '../services.js';
import { handleServiceError } from '../utils/errors.js';
import { jsonResult } from '../utils/response.js';

export function registerDocumentTools(server: McpServer) {
  server.tool(
    'documents_list',
    'List and search documents. Filter by category, folder, tags, storage type, expiry status.',
    {
      category: z.string().optional(),
      folder: z.string().optional(),
      storageType: z.enum(['local', 'external']).optional(),
      tags: z.array(z.string()).optional(),
      search: z.string().optional(),
      expiryStatus: z.enum(['expiring_soon', 'expired']).optional(),
      expiryDateFrom: z.string().optional(),
      expiryDateTo: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
      sortBy: z.string().default('updatedAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    },
    async (args) => {
      try {
        return jsonResult(await documentService.list(args));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'documents_get_expiring',
    'Get documents expiring within the next N days (default 30). Includes already expired.',
    { days: z.number().default(30) },
    async ({ days }) => {
      try {
        return jsonResult(await documentService.getExpiringDocuments(days));
      } catch (e) { handleServiceError(e); }
    },
  );
}
