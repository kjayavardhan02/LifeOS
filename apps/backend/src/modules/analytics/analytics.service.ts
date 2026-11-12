import { prisma } from '../../lib/prisma.js';
import {
  subDays,
  subMonths,
  startOfDay,
  startOfMonth,
  startOfWeek,
  format,
  differenceInDays,
} from 'date-fns';
import type {
  ProductivityStats,
  FinanceStats,
  AnalyticsHabitStats,
  AnalyticsGoalStats,
} from '@lifeos/shared';

function getDateRange(period: string): { start: Date; end: Date } {
  const end = new Date();
  let start: Date;
  switch (period) {
    case 'week':
      start = subDays(end, 7);
      break;
    case 'quarter':
      start = subMonths(end, 3);
      break;
    case 'year':
      start = subMonths(end, 12);
      break;
    case 'month':
    default:
      start = subMonths(end, 1);
      break;
  }
  return { start: startOfDay(start), end };
}

function getPreviousRange(start: Date, end: Date): { start: Date; end: Date } {
  const diff = differenceInDays(end, start);
  return {
    start: subDays(start, diff),
    end: start,
  };
}

export async function getProductivityStats(period: string): Promise<ProductivityStats> {
  const { start, end } = getDateRange(period);

  const [
    totalTasks,
    completedTasks,
    overdueTasks,
    tasksByStatus,
    tasksByPriority,
    tasksByCategory,
    completedWithDuration,
  ] = await Promise.all([
    prisma.task.count({
      where: { deletedAt: null, createdAt: { gte: start, lte: end } },
    }),
    prisma.task.count({
      where: { deletedAt: null, status: 'done', completedAt: { gte: start, lte: end } },
    }),
    prisma.task.count({
      where: {
        deletedAt: null,
        status: { in: ['todo', 'in_progress'] },
        dueDate: { lt: new Date() },
      },
    }),
    prisma.task.groupBy({
      by: ['status'],
      where: { deletedAt: null, createdAt: { gte: start, lte: end } },
      _count: true,
    }),
    prisma.task.groupBy({
      by: ['priority'],
      where: { deletedAt: null, createdAt: { gte: start, lte: end } },
      _count: true,
    }),
    prisma.task.groupBy({
      by: ['category'],
      where: { deletedAt: null, createdAt: { gte: start, lte: end } },
      _count: true,
      orderBy: { _count: { category: 'desc' } },
      take: 10,
    }),
    prisma.task.findMany({
      where: {
        deletedAt: null,
        status: 'done',
        completedAt: { gte: start, lte: end, not: null },
      },
      select: { createdAt: true, completedAt: true },
    }),
  ]);

  let avgCompletionDays: number | null = null;
  if (completedWithDuration.length > 0) {
    const totalDays = completedWithDuration.reduce((sum, t) => {
      return sum + differenceInDays(t.completedAt!, t.createdAt);
    }, 0);
    avgCompletionDays = Math.round((totalDays / completedWithDuration.length) * 10) / 10;
  }

  const completionTrend = await buildCompletionTrend(start, end);

  return {
    totalTasks,
    completedTasks,
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    overdueTasks,
    avgCompletionDays,
    tasksByStatus: tasksByStatus.map((r) => ({ status: r.status, count: r._count })),
    tasksByPriority: tasksByPriority.map((r) => ({ priority: r.priority, count: r._count })),
    tasksByCategory: tasksByCategory.map((r) => ({ category: r.category, count: r._count })),
    completionTrend,
  };
}

async function buildCompletionTrend(
  start: Date,
  end: Date,
): Promise<{ date: string; completed: number; created: number }[]> {
  const days = differenceInDays(end, start);
  const bucketFormat = days > 60 ? 'yyyy-MM' : 'yyyy-MM-dd';

  const [completed, created] = await Promise.all([
    prisma.task.findMany({
      where: { deletedAt: null, status: 'done', completedAt: { gte: start, lte: end } },
      select: { completedAt: true },
    }),
    prisma.task.findMany({
      where: { deletedAt: null, createdAt: { gte: start, lte: end } },
      select: { createdAt: true },
    }),
  ]);

  const buckets = new Map<string, { completed: number; created: number }>();

  completed.forEach((t) => {
    const key = format(t.completedAt!, bucketFormat);
    const b = buckets.get(key) ?? { completed: 0, created: 0 };
    b.completed++;
    buckets.set(key, b);
  });

  created.forEach((t) => {
    const key = format(t.createdAt, bucketFormat);
    const b = buckets.get(key) ?? { completed: 0, created: 0 };
    b.created++;
    buckets.set(key, b);
  });

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, ...vals }));
}

export async function getFinanceStats(period: string): Promise<FinanceStats> {
  const { start, end } = getDateRange(period);

  const transactions = await prisma.financeTransaction.findMany({
    where: { deletedAt: null, date: { gte: start, lte: end } },
    select: { amount: true, type: true, category: true, date: true },
  });

  let totalIncome = 0;
  let totalExpense = 0;
  const expenseByCat = new Map<string, number>();
  const incomeByCat = new Map<string, number>();
  const dailySpend = new Map<string, number>();

  for (const tx of transactions) {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
      incomeByCat.set(tx.category, (incomeByCat.get(tx.category) ?? 0) + tx.amount);
    } else if (tx.type === 'expense') {
      totalExpense += tx.amount;
      expenseByCat.set(tx.category, (expenseByCat.get(tx.category) ?? 0) + tx.amount);
      const dateKey = format(tx.date, 'yyyy-MM-dd');
      dailySpend.set(dateKey, (dailySpend.get(dateKey) ?? 0) + tx.amount);
    }
  }

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  const activeSubs = await prisma.subscription.findMany({
    where: { deletedAt: null, status: 'active' },
    select: { amount: true, billingCycle: true },
  });
  const totalSubscriptionCost = activeSubs.reduce((sum, s) => {
    switch (s.billingCycle) {
      case 'monthly':
        return sum + s.amount;
      case 'quarterly':
        return sum + s.amount / 3;
      case 'yearly':
        return sum + s.amount / 12;
      default:
        return sum + s.amount;
    }
  }, 0);

  const monthlyTrend = await buildMonthlyFinanceTrend();

  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpense: Math.round(totalExpense * 100) / 100,
    netSavings: Math.round(netSavings * 100) / 100,
    savingsRate,
    totalSubscriptionCost: Math.round(totalSubscriptionCost * 100) / 100,
    expenseByCategory: Array.from(expenseByCat.entries())
      .map(([category, amount]) => ({ category, amount: Math.round(amount * 100) / 100 }))
      .sort((a, b) => b.amount - a.amount),
    incomeByCategory: Array.from(incomeByCat.entries())
      .map(([category, amount]) => ({ category, amount: Math.round(amount * 100) / 100 }))
      .sort((a, b) => b.amount - a.amount),
    dailySpending: Array.from(dailySpend.entries())
      .map(([date, amount]) => ({ date, amount: Math.round(amount * 100) / 100 }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    monthlyTrend,
  };
}

async function buildMonthlyFinanceTrend() {
  const sixMonthsAgo = subMonths(new Date(), 6);

  const transactions = await prisma.financeTransaction.findMany({
    where: { deletedAt: null, date: { gte: startOfMonth(sixMonthsAgo) } },
    select: { amount: true, type: true, date: true },
  });

  const months = new Map<string, { income: number; expense: number }>();
  for (const tx of transactions) {
    const key = format(tx.date, 'yyyy-MM');
    const m = months.get(key) ?? { income: 0, expense: 0 };
    if (tx.type === 'income') m.income += tx.amount;
    else if (tx.type === 'expense') m.expense += tx.amount;
    months.set(key, m);
  }

  return Array.from(months.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, vals]) => ({
      month,
      income: Math.round(vals.income * 100) / 100,
      expense: Math.round(vals.expense * 100) / 100,
      savings: Math.round((vals.income - vals.expense) * 100) / 100,
    }));
}

export async function getHabitStats(period: string): Promise<AnalyticsHabitStats> {
  const { start, end } = getDateRange(period);
  const days = differenceInDays(end, start) || 1;

  const habits = await prisma.habit.findMany({
    where: { deletedAt: null },
    include: {
      logs: {
        where: { date: { gte: start, lte: end } },
        orderBy: { date: 'asc' },
      },
    },
  });

  const activeHabits = habits.filter((h) => !h.isArchived);
  let totalCompletionRate = 0;
  let longestStreak = 0;

  const habitPerformance = activeHabits.map((h) => {
    const rate = days > 0 ? Math.round((h.logs.length / days) * 100) : 0;
    totalCompletionRate += rate;
    if (h.streakLongest > longestStreak) longestStreak = h.streakLongest;

    return {
      id: h.id,
      name: h.name,
      color: h.color,
      completionRate: Math.min(rate, 100),
      currentStreak: h.streakCurrent,
      longestStreak: h.streakLongest,
      totalLogs: h.logs.length,
    };
  });

  const avgCompletionRate =
    activeHabits.length > 0 ? Math.round(totalCompletionRate / activeHabits.length) : 0;

  const weeklyHeatmap = await buildHabitHeatmap();

  return {
    totalHabits: habits.length,
    activeHabits: activeHabits.length,
    avgCompletionRate,
    longestStreak,
    habitPerformance: habitPerformance.sort((a, b) => b.completionRate - a.completionRate),
    weeklyHeatmap,
  };
}

async function buildHabitHeatmap(): Promise<{ date: string; count: number }[]> {
  const start = subDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 7 * 12);

  const logs = await prisma.habitLog.findMany({
    where: { date: { gte: start } },
    select: { date: true },
  });

  const counts = new Map<string, number>();
  for (const log of logs) {
    const key = format(log.date, 'yyyy-MM-dd');
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getGoalStats(period: string): Promise<AnalyticsGoalStats> {
  const { start, end } = getDateRange(period);

  const goals = await prisma.goal.findMany({
    where: { deletedAt: null },
    select: { status: true, type: true, progress: true },
  });

  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.status === 'completed').length;
  const inProgressGoals = goals.filter((g) => g.status === 'in_progress').length;
  const avgProgress =
    totalGoals > 0 ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / totalGoals) : 0;

  const statusCounts = new Map<string, number>();
  const typeCounts = new Map<string, number>();
  for (const g of goals) {
    statusCounts.set(g.status, (statusCounts.get(g.status) ?? 0) + 1);
    typeCounts.set(g.type, (typeCounts.get(g.type) ?? 0) + 1);
  }

  return {
    totalGoals,
    completedGoals,
    inProgressGoals,
    avgProgress,
    goalsByStatus: Array.from(statusCounts.entries()).map(([status, count]) => ({ status, count })),
    goalsByType: Array.from(typeCounts.entries()).map(([type, count]) => ({ type, count })),
  };
}

