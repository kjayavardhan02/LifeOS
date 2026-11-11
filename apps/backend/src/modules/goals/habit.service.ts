import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error-handler.js';
import type { z } from 'zod';
import type {
  createHabitSchema,
  updateHabitSchema,
  habitQuerySchema,
  logHabitSchema,
  habitLogsQuerySchema,
} from './habit.validator.js';

type CreateHabitInput = z.infer<typeof createHabitSchema>;
type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
type HabitQuery = z.infer<typeof habitQuerySchema>;
type LogHabitInput = z.infer<typeof logHabitSchema>;
type HabitLogsQuery = z.infer<typeof habitLogsQuerySchema>;

function buildWhereClause(filters: Omit<HabitQuery, 'page' | 'limit'>): Prisma.HabitWhereInput {
  const where: Prisma.HabitWhereInput = { deletedAt: null };

  if (filters.category) where.category = filters.category;
  if (filters.isArchived !== undefined) where.isArchived = filters.isArchived;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return where;
}

function getToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export const habitService = {
  async list(query: HabitQuery) {
    const { page, limit, ...filters } = query;
    const where = buildWhereClause(filters);
    const skip = (page - 1) * limit;
    const today = getToday();

    const [data, total] = await Promise.all([
      prisma.habit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          logs: {
            where: { date: today },
            take: 1,
          },
        },
      }),
      prisma.habit.count({ where }),
    ]);

    const enriched = data.map((habit) => ({
      ...habit,
      todayLog: habit.logs[0] ?? null,
      logs: undefined,
    }));

    return {
      data: enriched,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string) {
    const habit = await prisma.habit.findFirst({
      where: { id, deletedAt: null },
      include: {
        linkedGoals: { include: { goal: true } },
      },
    });
    if (!habit) throw new AppError(404, 'Habit not found');
    return habit;
  },

  async create(input: CreateHabitInput) {
    return prisma.habit.create({ data: input });
  },

  async update(id: string, input: UpdateHabitInput) {
    await this.getById(id);
    return prisma.habit.update({ where: { id }, data: input });
  },

  async delete(id: string) {
    await this.getById(id);
    await prisma.habit.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async logCompletion(habitId: string, input: LogHabitInput) {
    await this.getById(habitId);
    const date = new Date(input.date + 'T00:00:00.000Z');

    const existing = await prisma.habitLog.findUnique({
      where: { habitId_date: { habitId, date } },
    });

    let log;
    if (existing) {
      if (input.value === 0) {
        await prisma.habitLog.delete({ where: { id: existing.id } });
        await this.recalculateStreak(habitId);
        return null;
      }
      log = await prisma.habitLog.update({
        where: { id: existing.id },
        data: { value: input.value ?? 1, note: input.note },
      });
    } else {
      if (input.value === 0) return null;
      log = await prisma.habitLog.create({
        data: {
          habitId,
          date,
          value: input.value ?? 1,
          note: input.note,
        },
      });
    }

    await this.recalculateStreak(habitId);
    return log;
  },

  async getLogs(habitId: string, query: HabitLogsQuery) {
    await this.getById(habitId);
    const startDate = new Date(query.startDate + 'T00:00:00.000Z');
    const endDate = new Date(query.endDate + 'T23:59:59.999Z');

    return prisma.habitLog.findMany({
      where: {
        habitId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });
  },

  async recalculateStreak(habitId: string) {
    const habit = await prisma.habit.findUnique({ where: { id: habitId } });
    if (!habit) return;

    const logs = await prisma.habitLog.findMany({
      where: { habitId, value: { gt: 0 } },
      orderBy: { date: 'desc' },
      take: 365,
    });

    if (logs.length === 0) {
      await prisma.habit.update({
        where: { id: habitId },
        data: { streakCurrent: 0 },
      });
      return;
    }

    const logDates = new Set(
      logs.map((l) => l.date.toISOString().split('T')[0]),
    );

    let currentStreak = 0;
    const today = getToday();
    const checkDate = new Date(today);
    let freezesLeft = habit.streakFreezes - habit.freezesUsed;

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0]!;
      if (logDates.has(dateStr)) {
        currentStreak++;
      } else if (isScheduledDay(habit, checkDate)) {
        if (freezesLeft > 0) {
          freezesLeft--;
        } else {
          break;
        }
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    const longestStreak = Math.max(habit.streakLongest, currentStreak);

    await prisma.habit.update({
      where: { id: habitId },
      data: { streakCurrent: currentStreak, streakLongest: longestStreak },
    });
  },

  async getStats() {
    const today = getToday();

    const [totalHabits, activeHabits, todayLogs] = await Promise.all([
      prisma.habit.count({ where: { deletedAt: null } }),
      prisma.habit.count({ where: { deletedAt: null, isArchived: false } }),
      prisma.habitLog.findMany({
        where: { date: today, value: { gt: 0 } },
        distinct: ['habitId'],
      }),
    ]);

    const habits = await prisma.habit.findMany({
      where: { deletedAt: null, isArchived: false },
      select: { streakCurrent: true, streakLongest: true },
    });

    const currentBestStreak = habits.length > 0
      ? Math.max(...habits.map((h) => h.streakCurrent))
      : 0;
    const longestStreak = habits.length > 0
      ? Math.max(...habits.map((h) => h.streakLongest))
      : 0;

    return {
      totalHabits,
      activeHabits,
      completedToday: todayLogs.length,
      longestStreak,
      currentBestStreak,
    };
  },

  async getTodayChecklist() {
    const today = getToday();
    const dayName = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][today.getDay()]!;

    const habits = await prisma.habit.findMany({
      where: { deletedAt: null, isArchived: false },
      include: {
        logs: {
          where: { date: today },
          take: 1,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return habits
      .filter((h) => {
        if (h.frequency === 'daily') return true;
        if (h.frequency === 'specific_days') return h.targetDays.includes(dayName);
        return true;
      })
      .map((h) => ({
        ...h,
        todayLog: h.logs[0] ?? null,
        logs: undefined,
      }));
  },
};

function isScheduledDay(habit: { frequency: string; targetDays: string[] }, date: Date): boolean {
  if (habit.frequency === 'daily') return true;
  if (habit.frequency === 'specific_days') {
    const dayName = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()]!;
    return habit.targetDays.includes(dayName);
  }
  return true;
}
