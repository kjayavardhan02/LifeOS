import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { subscriptionService } from '../services.js';
import { handleServiceError } from '../utils/errors.js';
import { jsonResult } from '../utils/response.js';

export function registerSubscriptionTools(server: McpServer) {
  server.tool(
    'subscriptions_list',
    'List subscriptions with filters: status, category, billing cycle, search.',
    {
      status: z.enum(['active', 'paused', 'cancelled', 'trial']).optional(),
      category: z.string().optional(),
      billingCycle: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
      search: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
      sortBy: z.string().default('nextRenewalDate'),
      sortOrder: z.enum(['asc', 'desc']).default('asc'),
    },
    async (args) => {
      try {
        return jsonResult(await subscriptionService.list(args));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'subscriptions_create',
    'Add a new subscription with billing details, renewal date, and category.',
    {
      name: z.string(),
      provider: z.string().optional(),
      amount: z.number(),
      billingCycle: z.enum(['monthly', 'quarterly', 'yearly']),
      nextRenewalDate: z.string(),
      startDate: z.string(),
      paymentMethod: z.string().optional(),
      category: z.string().optional(),
      status: z.enum(['active', 'paused', 'cancelled', 'trial']).optional(),
      notes: z.string().optional(),
      url: z.string().optional(),
      reminderDaysBefore: z.number().optional(),
    },
    async (args) => {
      try {
        return jsonResult(await subscriptionService.create(args));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'subscriptions_update',
    'Update or cancel a subscription. Set status to "cancelled" to cancel it.',
    {
      id: z.string(),
      name: z.string().optional(),
      provider: z.string().optional(),
      amount: z.number().optional(),
      billingCycle: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
      nextRenewalDate: z.string().optional(),
      paymentMethod: z.string().optional(),
      category: z.string().optional(),
      status: z.enum(['active', 'paused', 'cancelled', 'trial']).optional(),
      notes: z.string().optional(),
      url: z.string().optional(),
    },
    async ({ id, ...data }) => {
      try {
        return jsonResult(await subscriptionService.update(id, data));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'subscriptions_get_summary',
    'Get subscription summary: total monthly/yearly costs, active count, upcoming renewals, category breakdown.',
    {},
    async () => {
      try {
        return jsonResult(await subscriptionService.getSummary());
      } catch (e) { handleServiceError(e); }
    },
  );
}
