import { z } from 'zod';

const transactionTypeEnum = z.enum(['income', 'expense', 'transfer']);

export const createTransactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: transactionTypeEnum,
  date: z.string().datetime(),
  category: z.string().min(1).max(100),
  subcategory: z.string().max(100).optional(),
  paymentMethod: z.string().max(50).optional(),
  merchant: z.string().max(200).optional(),
  notes: z.string().max(5000).optional(),
  tags: z.array(z.string().max(50)).optional(),
  isRecurring: z.boolean().optional(),
  recurringId: z.string().uuid().optional(),
  refundOfId: z.string().uuid().optional(),
  subscriptionId: z.string().uuid().optional(),
});

export const updateTransactionSchema = z.object({
  amount: z.number().positive('Amount must be positive').optional(),
  type: transactionTypeEnum.optional(),
  date: z.string().datetime().optional(),
  category: z.string().min(1).max(100).optional(),
  subcategory: z.string().max(100).nullable().optional(),
  paymentMethod: z.string().max(50).optional(),
  merchant: z.string().max(200).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  tags: z.array(z.string().max(50)).optional(),
});

export const transactionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['date', 'amount', 'createdAt']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  type: transactionTypeEnum.optional(),
  category: z.string().optional(),
  paymentMethod: z.string().optional(),
  search: z.string().max(200).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  amountMin: z.coerce.number().optional(),
  amountMax: z.coerce.number().optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
});

export const summaryQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
});

export const recentQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(5),
});

export const createBudgetSchema = z.object({
  category: z.string().max(100).nullable().optional(),
  amount: z.number().positive('Amount must be positive'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
});

export const updateBudgetSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
});

export const budgetQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
});
