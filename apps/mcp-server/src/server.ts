import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerTaskTools } from './tools/tasks.js';
import { registerCalendarTools } from './tools/calendar.js';
import { registerReminderTools } from './tools/reminders.js';
import { registerFinanceTools } from './tools/finance.js';
import { registerSubscriptionTools } from './tools/subscriptions.js';
import { registerProjectTools } from './tools/projects.js';
import { registerKnowledgeTools } from './tools/knowledge.js';
import { registerDocumentTools } from './tools/documents.js';
import { registerQuickCaptureTools } from './tools/quick-capture.js';
import { registerSearchTools } from './tools/search.js';
import { registerGoalTools } from './tools/goals.js';
import { registerHabitTools } from './tools/habits.js';
import { registerReadingTools } from './tools/reading.js';
import { registerAnalyticsTools } from './tools/analytics.js';

const server = new McpServer({
  name: 'lifeos',
  version: '0.1.0',
});

registerTaskTools(server);
registerCalendarTools(server);
registerReminderTools(server);
registerFinanceTools(server);
registerSubscriptionTools(server);
registerProjectTools(server);
registerKnowledgeTools(server);
registerDocumentTools(server);
registerQuickCaptureTools(server);
registerSearchTools(server);
registerGoalTools(server);
registerHabitTools(server);
registerReadingTools(server);
registerAnalyticsTools(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('LifeOS MCP Server running (52 tools)');
}

main().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
