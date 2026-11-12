import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { quickCaptureService } from '../services.js';
import { handleServiceError } from '../utils/errors.js';
import { jsonResult } from '../utils/response.js';

export function registerQuickCaptureTools(server: McpServer) {
  server.tool(
    'quick_capture',
    'Natural language capture: auto-detects intent and creates the right item (task, expense, note, reminder, or event). Examples: "buy groceries tomorrow" → task, "₹500 uber" → expense, "remind me to call dentist at 5pm" → reminder.',
    {
      input: z.string().describe('Natural language input'),
      type: z.enum(['task', 'expense', 'note', 'reminder', 'event']).optional().describe('Override auto-detected type'),
    },
    async ({ input, type }) => {
      try {
        return jsonResult(await quickCaptureService.capture(input, type));
      } catch (e) { handleServiceError(e); }
    },
  );
}
