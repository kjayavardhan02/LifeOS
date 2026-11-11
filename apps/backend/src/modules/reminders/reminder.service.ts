import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error-handler.js';
import type { z } from 'zod';
import type { createReminderSchema, updateReminderSchema, reminderQuerySchema } from './reminder.validator.js';

type CreateReminderInput = z.infer<typeof createReminderSchema>;
type UpdateReminderInput = z.infer<typeof updateReminderSchema>;
type ReminderQuery = z.infer<typeof reminderQuerySchema>;

export const reminderService = {
  async list(query: ReminderQuery) {
    const { page, limit, sortBy, sortOrder, ...filters } = query;
    const where = buildWhereClause(filters);
    const skip = (page - 1) * limit;

    const orderBy: Record<string, string> = {};
    orderBy[sortBy] = sortOrder;

    const [data, total] = await Promise.all([
      prisma.reminder.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.reminder.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const reminder = await prisma.reminder.findFirst({
      where: { id, deletedAt: null },
    });
    if (!reminder) throw new AppError(404, 'Reminder not found', 'NOT_FOUND');
    return reminder;
  },

  async create(input: CreateReminderInput) {
    return prisma.reminder.create({
      data: {
        ...input,
        dueDate: new Date(input.dueDate),
        recurrenceEndDate: input.recurrenceEndDate ? new Date(input.recurrenceEndDate) : undefined,
      },
    });
  },

  async update(id: string, input: UpdateReminderInput) {
    await this.getById(id);

    const data: Prisma.ReminderUpdateInput = { ...input };

    if (input.dueDate !== undefined) {
      data.dueDate = new Date(input.dueDate);
    }
    if (input.recurrenceEndDate !== undefined) {
      data.recurrenceEndDate = input.recurrenceEndDate ? new Date(input.recurrenceEndDate) : null;
    }
    if (input.snoozedUntil !== undefined) {
      data.snoozedUntil = input.snoozedUntil ? new Date(input.snoozedUntil) : null;
    }
    if (input.status === 'done') {
      data.completedAt = new Date();
    } else if (input.status && input.status !== 'done') {
      data.completedAt = null;
    }

    return prisma.reminder.update({ where: { id }, data });
  },

  async delete(id: string) {
    await this.getById(id);
    await prisma.reminder.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async snooze(id: string, minutes: number) {
    await this.getById(id);
    const snoozedUntil = new Date(Date.now() + minutes * 60 * 1000);
    return prisma.reminder.update({
      where: { id },
      data: { status: 'snoozed', snoozedUntil },
    });
  },

  async dismiss(id: string) {
    await this.getById(id);
    return prisma.reminder.update({
      where: { id },
      data: { status: 'dismissed' },
    });
  },

  async markDone(id: string) {
    await this.getById(id);
    return prisma.reminder.update({
      where: { id },
      data: { status: 'done', completedAt: new Date() },
    });
  },

  async getActive() {
    return prisma.reminder.findMany({
      where: {
        deletedAt: null,
        status: { in: ['pending', 'snoozed'] },
      },
      orderBy: { dueDate: 'asc' },
      take: 20,
    });
  },
};

function buildWhereClause(filters: Omit<ReminderQuery, 'page' | 'limit' | 'sortBy' | 'sortOrder'>): Prisma.ReminderWhereInput {
  const where: Prisma.ReminderWhereInput = { deletedAt: null };

  if (filters.status) {
    where.status = Array.isArray(filters.status)
      ? { in: filters.status }
      : filters.status;
  }

  if (filters.priority) {
    where.priority = Array.isArray(filters.priority)
      ? { in: filters.priority }
      : filters.priority;
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.linkedModule) {
    where.linkedModule = filters.linkedModule;
  }

  if (filters.isOverdue) {
    where.dueDate = { lt: new Date() };
    where.status = { in: ['pending', 'snoozed'] };
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.dueDateFrom || filters.dueDateTo) {
    where.dueDate = {
      ...(where.dueDate as Prisma.DateTimeFilter || {}),
      ...(filters.dueDateFrom ? { gte: new Date(filters.dueDateFrom) } : {}),
      ...(filters.dueDateTo ? { lte: new Date(filters.dueDateTo) } : {}),
    };
  }

  return where;
}
