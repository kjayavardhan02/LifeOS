import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getProductivityStats, getFinanceStats, getHabitStats, getGoalStats } from '../services.js';
import { handleServiceError } from '../utils/errors.js';
import { jsonResult } from '../utils/response.js';

export function registerAnalyticsTools(server: McpServer) {
  server.tool(
    'analytics_productivity',
    'Task productivity analytics: completion rate, overdue count, avg completion time, breakdown by status/priority/category, trend.',
    { period: z.enum(['week', 'month', 'quarter', 'year']).default('month') },
    async ({ period }) => {
      try {
        return jsonResult(await getProductivityStats(period));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'analytics_finance',
    'Finance analytics: income/expense totals, savings rate, category breakdowns, daily spending, monthly trend.',
    { period: z.enum(['week', 'month', 'quarter', 'year']).default('month') },
    async ({ period }) => {
      try {
        return jsonResult(await getFinanceStats(period));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'analytics_habits',
    'Habit analytics: completion rates, streaks, per-habit performance, weekly heatmap.',
    { period: z.enum(['week', 'month', 'quarter', 'year']).default('month') },
    async ({ period }) => {
      try {
        return jsonResult(await getHabitStats(period));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'analytics_goals',
    'Goal analytics: total/completed/in-progress counts, average progress, breakdown by status and type.',
    { period: z.enum(['week', 'month', 'quarter', 'year']).default('month') },
    async ({ period }) => {
      try {
        return jsonResult(await getGoalStats(period));
      } catch (e) { handleServiceError(e); }
    },
  );
}
