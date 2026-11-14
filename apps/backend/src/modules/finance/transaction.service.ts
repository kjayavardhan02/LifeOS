import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error-handler.js';
import { eventBus } from '../../lib/event-bus.js';
import type { z } from 'zod';
import type {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
} from './transaction.validator.js';

type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
type TransactionQuery = z.infer<typeof transactionQuerySchema>;

export const transactionService = {
  async list(query: TransactionQuery) {
    const { page, limit, sortBy, sortOrder, ...filters } = query;
    const where = buildWhereClause(filters);
    const skip = (page - 1) * limit;

    const orderBy: Record<string, string> = {};
    orderBy[sortBy] = sortOrder;

    const [data, total] = await Promise.all([
      prisma.financeTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.financeTransaction.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const transaction = await prisma.financeTransaction.findFirst({
      where: { id, deletedAt: null },
    });
    if (!transaction) throw new AppError(404, 'Transaction not found', 'NOT_FOUND');
    return transaction;
  },

  async create(input: CreateTransactionInput) {
    const transaction = await prisma.financeTransaction.create({
      data: {
        ...input,
        date: new Date(input.date),
      },
    });

    eventBus.emit('transaction.created', {
      transactionId: transaction.id,
      title: transaction.merchant ?? transaction.category,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
    });

    return transaction;
  },

  async update(id: string, input: UpdateTransactionInput) {
    await this.getById(id);

    const data: Prisma.FinanceTransactionUpdateInput = { ...input };

    if (input.date !== undefined) {
      data.date = new Date(input.date);
    }

    return prisma.financeTransaction.update({ where: { id }, data });
  },

  async delete(id: string) {
    await this.getById(id);
    await prisma.financeTransaction.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async getSummary(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const transactions = await prisma.financeTransaction.findMany({
      where: {
        deletedAt: null,
        date: { gte: startDate, lte: endDate },
      },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryMap = new Map<string, number>();
    const dailyMap = new Map<string, { income: number; expense: number }>();

    for (const tx of transactions) {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else if (tx.type === 'expense') {
        totalExpense += tx.amount;

        const current = categoryMap.get(tx.category) ?? 0;
        categoryMap.set(tx.category, current + tx.amount);
      }

      const dayKey = tx.date.toISOString().slice(0, 10);
      const dayEntry = dailyMap.get(dayKey) ?? { income: 0, expense: 0 };
      if (tx.type === 'income') {
        dayEntry.income += tx.amount;
      } else if (tx.type === 'expense') {
        dayEntry.expense += tx.amount;
      }
      dailyMap.set(dayKey, dayEntry);
    }

    const savings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Build daily trend for all days in the month
    const daysInMonth = endDate.getDate();
    const dailyTrend: { date: string; income: number; expense: number }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const entry = dailyMap.get(dayStr);
      dailyTrend.push({
        date: dayStr,
        income: entry?.income ?? 0,
        expense: entry?.expense ?? 0,
      });
    }

    return {
      totalIncome,
      totalExpense,
      savings,
      savingsRate: Math.round(savingsRate * 100) / 100,
      categoryBreakdown,
      dailyTrend,
    };
  },

  async getComparison(month: number, year: number) {
    const currStart = new Date(year, month - 1, 1);
    const currEnd = new Date(year, month, 0, 23, 59, 59, 999);

    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevStart = new Date(prevYear, prevMonth - 1, 1);
    const prevEnd = new Date(prevYear, prevMonth, 0, 23, 59, 59, 999);

    const MONTHS = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const [currTx, prevTx] = await Promise.all([
      prisma.financeTransaction.findMany({
        where: { deletedAt: null, date: { gte: currStart, lte: currEnd } },
      }),
      prisma.financeTransaction.findMany({
        where: { deletedAt: null, date: { gte: prevStart, lte: prevEnd } },
      }),
    ]);

    function buildMonthSummary(
      transactions: typeof currTx,
      m: number,
      y: number,
    ) {
      let totalIncome = 0;
      let totalExpense = 0;
      const catMap = new Map<string, number>();

      for (const tx of transactions) {
        if (tx.type === 'income') totalIncome += tx.amount;
        else if (tx.type === 'expense') {
          totalExpense += tx.amount;
          catMap.set(tx.category, (catMap.get(tx.category) ?? 0) + tx.amount);
        }
      }

      const savings = totalIncome - totalExpense;
      const savingsRate = totalIncome > 0 ? Math.round(((savings) / totalIncome) * 100 * 100) / 100 : 0;

      return {
        label: `${MONTHS[m - 1]} ${y}`,
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpense: Math.round(totalExpense * 100) / 100,
        savings: Math.round(savings * 100) / 100,
        savingsRate,
        transactionCount: transactions.length,
        categoryBreakdown: Array.from(catMap.entries())
          .map(([category, amount]) => ({ category, amount: Math.round(amount * 100) / 100 }))
          .sort((a, b) => b.amount - a.amount),
      };
    }

    const current = buildMonthSummary(currTx, month, year);
    const previous = buildMonthSummary(prevTx, prevMonth, prevYear);

    const pctChange = (curr: number, prev: number) =>
      prev !== 0 ? Math.round(((curr - prev) / Math.abs(prev)) * 100 * 100) / 100 : curr > 0 ? 100 : 0;

    const allCategories = new Set([
      ...current.categoryBreakdown.map((c) => c.category),
      ...previous.categoryBreakdown.map((c) => c.category),
    ]);

    const prevCatMap = new Map(previous.categoryBreakdown.map((c) => [c.category, c.amount]));
    const currCatMap = new Map(current.categoryBreakdown.map((c) => [c.category, c.amount]));

    const categoryComparison = Array.from(allCategories)
      .map((category) => {
        const c = currCatMap.get(category) ?? 0;
        const p = prevCatMap.get(category) ?? 0;
        return { category, current: c, previous: p, delta: pctChange(c, p) };
      })
      .sort((a, b) => b.current - a.current);

    return {
      current,
      previous,
      deltas: {
        income: pctChange(current.totalIncome, previous.totalIncome),
        expense: pctChange(current.totalExpense, previous.totalExpense),
        savings: pctChange(current.savings, previous.savings),
        savingsRate: Math.round((current.savingsRate - previous.savingsRate) * 100) / 100,
      },
      categoryComparison,
    };
  },

  async getRecent(limit: number) {
    return prisma.financeTransaction.findMany({
      where: { deletedAt: null },
      orderBy: { date: 'desc' },
      take: limit,
    });
  },
};

function buildWhereClause(
  filters: Omit<TransactionQuery, 'page' | 'limit' | 'sortBy' | 'sortOrder'>,
): Prisma.FinanceTransactionWhereInput {
  const where: Prisma.FinanceTransactionWhereInput = { deletedAt: null };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.paymentMethod) {
    where.paymentMethod = filters.paymentMethod;
  }

  if (filters.search) {
    where.OR = [
      { merchant: { contains: filters.search, mode: 'insensitive' } },
      { notes: { contains: filters.search, mode: 'insensitive' } },
      { category: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.dateFrom || filters.dateTo) {
    where.date = {
      ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
      ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}),
    };
  }

  if (filters.amountMin !== undefined || filters.amountMax !== undefined) {
    where.amount = {
      ...(filters.amountMin !== undefined ? { gte: filters.amountMin } : {}),
      ...(filters.amountMax !== undefined ? { lte: filters.amountMax } : {}),
    };
  }

  if (filters.tags) {
    const tagArray = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
    where.tags = { hasSome: tagArray };
  }

  return where;
}
