import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { transactionService, budgetService } from '../services.js';
import { handleServiceError } from '../utils/errors.js';
import { jsonResult } from '../utils/response.js';

export function registerFinanceTools(server: McpServer) {
  server.tool(
    'finance_list_transactions',
    'List financial transactions with filters: type (income/expense/transfer), category, date range, amount range, merchant search.',
    {
      type: z.enum(['income', 'expense', 'transfer']).optional(),
      category: z.string().optional(),
      paymentMethod: z.string().optional(),
      search: z.string().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      amountMin: z.number().optional(),
      amountMax: z.number().optional(),
      tags: z.array(z.string()).optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
      sortBy: z.string().default('date'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    },
    async (args) => {
      try {
        return jsonResult(await transactionService.list(args));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'finance_add_transaction',
    'Record a financial transaction (income, expense, or transfer).',
    {
      amount: z.number(),
      type: z.enum(['income', 'expense', 'transfer']),
      category: z.string(),
      date: z.string(),
      merchant: z.string().optional(),
      notes: z.string().optional(),
      paymentMethod: z.string().optional(),
      tags: z.array(z.string()).optional(),
    },
    async (args) => {
      try {
        return jsonResult(await transactionService.create(args));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'finance_get_summary',
    'Get monthly financial summary: total income, expenses, savings rate, category breakdown, daily trend.',
    {
      month: z.number().min(1).max(12),
      year: z.number(),
    },
    async ({ month, year }) => {
      try {
        return jsonResult(await transactionService.getSummary(month, year));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'finance_get_comparison',
    'Compare finances between a month and its previous month: income/expense deltas, category-by-category comparison.',
    {
      month: z.number().min(1).max(12),
      year: z.number(),
    },
    async ({ month, year }) => {
      try {
        return jsonResult(await transactionService.getComparison(month, year));
      } catch (e) { handleServiceError(e); }
    },
  );

  server.tool(
    'finance_list_budgets',
    'List budgets for a given month with actual spend amounts per category.',
    {
      month: z.number().min(1).max(12),
      year: z.number(),
    },
    async ({ month, year }) => {
      try {
        return jsonResult(await budgetService.list(month, year));
      } catch (e) { handleServiceError(e); }
    },
  );
}
