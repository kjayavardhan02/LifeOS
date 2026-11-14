import { prisma } from '../../lib/prisma.js';
import type { LifeContextSnapshot } from '@lifeos/shared';

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export const lifeContextService = {
  async getSnapshot(): Promise<LifeContextSnapshot> {
    const now = new Date();
    const todayEnd = endOfDay(now);
    const weekEnd = addDays(todayEnd, 7);

    const [
      todayTasks,
      overdueTasks,
      activeReminders,
      upcomingEvents,
      upcomingRenewals,
      recentTransactions,
      activeGoals,
      expiringDocuments,
    ] = await Promise.all([
      prisma.task.findMany({
        where: {
          deletedAt: null,
          status: { in: ['todo', 'in_progress'] },
          dueDate: { gte: now, lte: todayEnd },
        },
        select: { id: true, title: true, dueDate: true, status: true, priority: true },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.task.findMany({
        where: {
          deletedAt: null,
          status: { in: ['todo', 'in_progress'] },
          dueDate: { lt: now },
        },
        select: { id: true, title: true, dueDate: true, status: true, priority: true },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),
      prisma.reminder.findMany({
        where: {
          deletedAt: null,
          status: { in: ['pending', 'snoozed'] },
          dueDate: { lte: todayEnd },
        },
        select: { id: true, title: true, dueDate: true, priority: true, category: true },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.calendarEvent.findMany({
        where: { deletedAt: null, startDate: { gte: now, lte: weekEnd } },
        select: { id: true, title: true, startDate: true, endDate: true, category: true },
        orderBy: { startDate: 'asc' },
        take: 10,
      }),
      prisma.subscription.findMany({
        where: {
          deletedAt: null,
          status: 'active',
          nextRenewalDate: { gte: now, lte: weekEnd },
        },
        select: { id: true, name: true, amount: true, nextRenewalDate: true, billingCycle: true },
        orderBy: { nextRenewalDate: 'asc' },
      }),
      prisma.financeTransaction.findMany({
        where: { deletedAt: null },
        select: { id: true, amount: true, type: true, category: true, date: true, merchant: true },
        orderBy: { date: 'desc' },
        take: 5,
      }),
      prisma.goal.findMany({
        where: { deletedAt: null, status: 'in_progress' },
        select: { id: true, title: true, progress: true, status: true },
        take: 5,
      }),
      prisma.document.findMany({
        where: {
          deletedAt: null,
          expiryDate: { gte: now, lte: weekEnd },
        },
        select: { id: true, name: true, expiryDate: true, category: true },
        orderBy: { expiryDate: 'asc' },
      }),
    ]);

    return {
      todayTasks: todayTasks.map((t) => ({ ...t, dueDate: t.dueDate?.toISOString() ?? null })),
      overdueTasks: overdueTasks.map((t) => ({ ...t, dueDate: t.dueDate?.toISOString() ?? null })),
      activeReminders: activeReminders.map((r) => ({ ...r, dueDate: r.dueDate.toISOString() })),
      upcomingEvents: upcomingEvents.map((e) => ({ ...e, startDate: e.startDate.toISOString(), endDate: e.endDate.toISOString() })),
      upcomingRenewals: upcomingRenewals.map((s) => ({ ...s, nextRenewalDate: s.nextRenewalDate.toISOString() })),
      recentTransactions: recentTransactions.map((t) => ({ ...t, date: t.date.toISOString() })),
      activeGoals,
      expiringDocuments: expiringDocuments.map((d) => ({ ...d, expiryDate: d.expiryDate!.toISOString() })),
    };
  },
};
