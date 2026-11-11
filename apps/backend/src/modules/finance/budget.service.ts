import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error-handler.js';
import type { z } from 'zod';
import type { createBudgetSchema, updateBudgetSchema } from './transaction.validator.js';

type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;

export const budgetService = {
  async list(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const budgets = await prisma.budget.findMany({
      where: { month, year, deletedAt: null },
      orderBy: { category: 'asc' },
    });

    // Compute spent amounts for each budget by summing expenses in that category
    const expenses = await prisma.financeTransaction.findMany({
      where: {
        deletedAt: null,
        type: 'expense',
        date: { gte: startDate, lte: endDate },
      },
      select: { category: true, amount: true },
    });

    const spentByCategory = new Map<string | null, number>();
    let totalSpent = 0;
    for (const expense of expenses) {
      const current = spentByCategory.get(expense.category) ?? 0;
      spentByCategory.set(expense.category, current + expense.amount);
      totalSpent += expense.amount;
    }

    return budgets.map((budget) => ({
      ...budget,
      spent: budget.category
        ? spentByCategory.get(budget.category) ?? 0
        : totalSpent,
    }));
  },

  async create(input: CreateBudgetInput) {
    // Check for duplicate (category + month + year)
    const existing = await prisma.budget.findFirst({
      where: {
        category: input.category ?? null,
        month: input.month,
        year: input.year,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new AppError(
        400,
        `Budget for ${input.category ?? 'Overall'} in ${input.month}/${input.year} already exists`,
        'DUPLICATE_BUDGET',
      );
    }

    return prisma.budget.create({
      data: {
        category: input.category ?? null,
        amount: input.amount,
        month: input.month,
        year: input.year,
      },
    });
  },

  async update(id: string, input: UpdateBudgetInput) {
    const budget = await prisma.budget.findFirst({
      where: { id, deletedAt: null },
    });
    if (!budget) throw new AppError(404, 'Budget not found', 'NOT_FOUND');

    return prisma.budget.update({
      where: { id },
      data: { amount: input.amount },
    });
  },

  async delete(id: string) {
    const budget = await prisma.budget.findFirst({
      where: { id, deletedAt: null },
    });
    if (!budget) throw new AppError(404, 'Budget not found', 'NOT_FOUND');

    await prisma.budget.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
