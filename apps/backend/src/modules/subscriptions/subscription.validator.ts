import { z } from 'zod';

const billingCycleEnum = z.enum(['monthly', 'quarterly', 'yearly']);
const subscriptionStatusEnum = z.enum(['active', 'paused', 'cancelled', 'trial', 'expired']);

export const createSubscriptionSchema = z.object({
  name: z.string().min(1).max(500),
  provider: z.string().max(200).optional(),
  amount: z.number().positive(),
  billingCycle: billingCycleEnum.optional(),
  nextRenewalDate: z.string().datetime(),
  paymentMethod: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  status: subscriptionStatusEnum.optional(),
  startDate: z.string().datetime(),
  notes: z.string().max(5000).optional(),
  url: z.string().max(2000).optional(),
  reminderDaysBefore: z.array(z.number().int().min(0).max(365)).optional(),
});

export const updateSubscriptionSchema = z.object({
  name: z.string().min(1).max(500).optional(),
  provider: z.string().max(200).nullable().optional(),
  amount: z.number().positive().optional(),
  billingCycle: billingCycleEnum.optional(),
  nextRenewalDate: z.string().datetime().optional(),
  paymentMethod: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  status: subscriptionStatusEnum.optional(),
  notes: z.string().max(5000).nullable().optional(),
  url: z.string().max(2000).nullable().optional(),
  reminderDaysBefore: z.array(z.number().int().min(0).max(365)).optional(),
});

export const subscriptionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['nextRenewalDate', 'name', 'amount', 'createdAt']).default('nextRenewalDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  status: subscriptionStatusEnum.optional(),
  category: z.string().optional(),
  search: z.string().max(200).optional(),
  billingCycle: billingCycleEnum.optional(),
});

export const upcomingQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});
