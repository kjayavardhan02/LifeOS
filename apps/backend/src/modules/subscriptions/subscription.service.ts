import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error-handler.js';
import type { z } from 'zod';
import type {
  createSubscriptionSchema,
  updateSubscriptionSchema,
  subscriptionQuerySchema,
} from './subscription.validator.js';

type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
type SubscriptionQuery = z.infer<typeof subscriptionQuerySchema>;

type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

function computeMonthlyEquivalent(amount: number, cycle: BillingCycle): number {
  switch (cycle) {
    case 'monthly':
      return amount;
    case 'quarterly':
      return amount / 3;
    case 'yearly':
      return amount / 12;
  }
}

function computeYearlyTotal(amount: number, cycle: BillingCycle): number {
  switch (cycle) {
    case 'monthly':
      return amount * 12;
    case 'quarterly':
      return amount * 4;
    case 'yearly':
      return amount;
  }
}

function attachComputedFields<T extends { amount: number; billingCycle: BillingCycle }>(
  sub: T,
): T & { monthlyEquivalent: number; yearlyTotal: number } {
  return {
    ...sub,
    monthlyEquivalent: Math.round(computeMonthlyEquivalent(sub.amount, sub.billingCycle) * 100) / 100,
    yearlyTotal: Math.round(computeYearlyTotal(sub.amount, sub.billingCycle) * 100) / 100,
  };
}

export const subscriptionService = {
  async list(query: SubscriptionQuery) {
    const { page, limit, sortBy, sortOrder, ...filters } = query;
    const where = buildWhereClause(filters);
    const skip = (page - 1) * limit;

    const orderBy: Record<string, string> = {};
    orderBy[sortBy] = sortOrder;

    const [data, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.subscription.count({ where }),
    ]);

    return {
      data: data.map(attachComputedFields),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const subscription = await prisma.subscription.findFirst({
      where: { id, deletedAt: null },
      include: { transactions: { where: { deletedAt: null }, orderBy: { date: 'desc' } } },
    });
    if (!subscription) throw new AppError(404, 'Subscription not found', 'NOT_FOUND');
    return attachComputedFields(subscription);
  },

  async create(input: CreateSubscriptionInput) {
    const subscription = await prisma.subscription.create({
      data: {
        name: input.name,
        provider: input.provider,
        amount: input.amount,
        billingCycle: input.billingCycle,
        nextRenewalDate: new Date(input.nextRenewalDate),
        paymentMethod: input.paymentMethod,
        category: input.category,
        status: input.status,
        startDate: new Date(input.startDate),
        notes: input.notes,
        url: input.url,
        reminderDaysBefore: input.reminderDaysBefore,
      },
    });
    return attachComputedFields(subscription);
  },

  async update(id: string, input: UpdateSubscriptionInput) {
    await this.getById(id);

    const data: Prisma.SubscriptionUpdateInput = { ...input };

    if (input.nextRenewalDate !== undefined) {
      data.nextRenewalDate = new Date(input.nextRenewalDate);
    }

    return prisma.subscription
      .update({ where: { id }, data })
      .then(attachComputedFields);
  },

  async delete(id: string) {
    await this.getById(id);
    await prisma.subscription.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async getSummary() {
    const activeSubscriptions = await prisma.subscription.findMany({
      where: { deletedAt: null, status: 'active' },
    });

    let totalMonthly = 0;
    let totalYearly = 0;
    for (const sub of activeSubscriptions) {
      totalMonthly += computeMonthlyEquivalent(sub.amount, sub.billingCycle);
      totalYearly += computeYearlyTotal(sub.amount, sub.billingCycle);
    }

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const upcomingRenewals = await prisma.subscription.findMany({
      where: {
        deletedAt: null,
        status: 'active',
        nextRenewalDate: { gte: now, lte: thirtyDaysFromNow },
      },
      orderBy: { nextRenewalDate: 'asc' },
    });

    // Category breakdown for active subscriptions
    const categoryMap = new Map<string, { amount: number; count: number }>();
    for (const sub of activeSubscriptions) {
      const existing = categoryMap.get(sub.category) ?? { amount: 0, count: 0 };
      existing.amount += computeMonthlyEquivalent(sub.amount, sub.billingCycle);
      existing.count += 1;
      categoryMap.set(sub.category, existing);
    }

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, { amount, count }]) => ({
        category,
        amount: Math.round(amount * 100) / 100,
        count,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalMonthly: Math.round(totalMonthly * 100) / 100,
      totalYearly: Math.round(totalYearly * 100) / 100,
      activeCount: activeSubscriptions.length,
      upcomingRenewals: upcomingRenewals.map(attachComputedFields),
      categoryBreakdown,
    };
  },

  async getUpcomingRenewals(days: number) {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const subscriptions = await prisma.subscription.findMany({
      where: {
        deletedAt: null,
        status: 'active',
        nextRenewalDate: { gte: now, lte: future },
      },
      orderBy: { nextRenewalDate: 'asc' },
    });

    return subscriptions.map(attachComputedFields);
  },
};

function buildWhereClause(
  filters: Omit<SubscriptionQuery, 'page' | 'limit' | 'sortBy' | 'sortOrder'>,
): Prisma.SubscriptionWhereInput {
  const where: Prisma.SubscriptionWhereInput = { deletedAt: null };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.billingCycle) {
    where.billingCycle = filters.billingCycle;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { provider: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return where;
}
