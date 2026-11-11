import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error-handler.js';
import type { z } from 'zod';
import type { createEventSchema, updateEventSchema, eventQuerySchema } from './event.validator.js';

type CreateEventInput = z.infer<typeof createEventSchema>;
type UpdateEventInput = z.infer<typeof updateEventSchema>;
type EventQuery = z.infer<typeof eventQuerySchema>;

export const eventService = {
  async list(query: EventQuery) {
    const { page, limit, sortBy, sortOrder, ...filters } = query;
    const where = buildWhereClause(filters);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.calendarEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.calendarEvent.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const event = await prisma.calendarEvent.findFirst({
      where: { id, deletedAt: null },
    });
    if (!event) throw new AppError(404, 'Event not found', 'NOT_FOUND');
    return event;
  },

  async create(input: CreateEventInput) {
    return prisma.calendarEvent.create({
      data: {
        ...input,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        recurrenceEndDate: input.recurrenceEndDate ? new Date(input.recurrenceEndDate) : undefined,
      },
    });
  },

  async update(id: string, input: UpdateEventInput) {
    await this.getById(id);

    const data: Prisma.CalendarEventUpdateInput = { ...input };

    if (input.startDate !== undefined) {
      data.startDate = new Date(input.startDate);
    }
    if (input.endDate !== undefined) {
      data.endDate = new Date(input.endDate);
    }
    if (input.recurrenceEndDate !== undefined) {
      data.recurrenceEndDate = input.recurrenceEndDate ? new Date(input.recurrenceEndDate) : null;
    }

    return prisma.calendarEvent.update({ where: { id }, data });
  },

  async delete(id: string) {
    await this.getById(id);
    await prisma.calendarEvent.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async getUpcoming(days: number = 7) {
    const now = new Date();
    const end = new Date();
    end.setDate(end.getDate() + days);

    return prisma.calendarEvent.findMany({
      where: {
        deletedAt: null,
        startDate: { gte: now, lte: end },
      },
      orderBy: { startDate: 'asc' },
      take: 20,
    });
  },
};

function buildWhereClause(filters: Omit<EventQuery, 'page' | 'limit' | 'sortBy' | 'sortOrder'>): Prisma.CalendarEventWhereInput {
  const where: Prisma.CalendarEventWhereInput = { deletedAt: null };

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.isAllDay !== undefined) {
    where.isAllDay = filters.isAllDay;
  }

  if (filters.startFrom || filters.startTo) {
    where.startDate = {
      ...(filters.startFrom ? { gte: new Date(filters.startFrom) } : {}),
      ...(filters.startTo ? { lte: new Date(filters.startTo) } : {}),
    };
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { location: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return where;
}
