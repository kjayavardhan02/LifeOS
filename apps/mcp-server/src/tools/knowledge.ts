import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { knowledgeService } from '../services.js';
import { handleServiceError } from '../utils/errors.js';
import { jsonResult } from '../utils/response.js';

export function registerKnowledgeTools(server: McpServer) {
  server.tool(
    'knowledge_list_notes',
    'List and search knowledge notes. Filter by folder, tags, pinned, archived, quick notes.',
    {
      folder: z.string().optional(),
      tags: z.array(z.string()).optional(),
      isPinned: z.boolean().optional(),
      isArchived: z.boolean().optional(),
      isQuickNote: z.boolean().optional(),
      search: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
      sortBy: z.string().default('updatedAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    },
    async (args) => {
      try {
        return jsonResult(await knowledgeService.listNotes(args));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'knowledge_get_note',
    'Get full note content. For Obsidian vault notes, reads fresh content from disk.',
    { id: z.string() },
    async ({ id }) => {
      try {
        return jsonResult(await knowledgeService.getNote(id));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'knowledge_create_note',
    'Create a quick note. Saves as .md file to the Obsidian vault (LifeOS-Notes folder).',
    {
      title: z.string(),
      content: z.string().optional(),
      tags: z.array(z.string()).optional(),
    },
    async (args) => {
      try {
        return jsonResult(await knowledgeService.createQuickNote(args));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'knowledge_update_note',
    'Update a note: title, content, tags, pin/archive status.',
    {
      id: z.string(),
      title: z.string().optional(),
      content: z.string().optional(),
      tags: z.array(z.string()).optional(),
      folder: z.string().optional(),
      isPinned: z.boolean().optional(),
      isArchived: z.boolean().optional(),
    },
    async ({ id, ...data }) => {
      try {
        return jsonResult(await knowledgeService.updateQuickNote(id, data));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'knowledge_save_bookmark',
    'Save a web bookmark with URL, title, description, and tags.',
    {
      url: z.string(),
      title: z.string(),
      description: z.string().optional(),
      favicon: z.string().optional(),
      tags: z.array(z.string()).optional(),
    },
    async (args) => {
      try {
        return jsonResult(await knowledgeService.createBookmark(args));
      } catch (e) { handleServiceError(e); }
    },
  );
}
