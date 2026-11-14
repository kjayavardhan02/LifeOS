import { prisma } from '../../lib/prisma.js';
import type { CalendarFeedItem } from '@lifeos/shared';

export const calendarFeedService = {
  async getFeed(startFrom: string, startTo: string): Promise<CalendarFeedItem[]> {
    const start = new Date(startFrom);
    const end = new Date(startTo);

    const [events, tasks, reminders, subscriptions] = await Promise.all([
      prisma.calendarEvent.findMany({
        where: { deletedAt: null, startDate: { gte: start, lte: end } },
      }),
      prisma.task.findMany({
        where: {
          deletedAt: null,
          dueDate: { not: null, gte: start, lte: end },
          status: { notIn: ['done', 'cancelled'] },
        },
      }),
      prisma.reminder.findMany({
        where: {
          deletedAt: null,
          dueDate: { gte: start, lte: end },
          status: { in: ['pending', 'snoozed'] },
        },
      }),
      prisma.subscription.findMany({
        where: {
          deletedAt: null,
          status: 'active',
          nextRenewalDate: { gte: start, lte: end },
        },
      }),
    ]);

    const items: CalendarFeedItem[] = [
      ...events.map((e) => ({
        id: e.id,
        title: e.title,
        startDate: e.startDate.toISOString(),
        endDate: e.endDate.toISOString(),
        source: 'event' as const,
        sourceId: e.id,
        color: e.color,
        isReadOnly: false,
        isAllDay: e.isAllDay,
      })),
      ...tasks.map((t) => ({
        id: `task-${t.id}`,
        title: `[Task] ${t.title}`,
        startDate: t.dueDate!.toISOString(),
        endDate: t.dueDate!.toISOString(),
        source: 'task' as const,
        sourceId: t.id,
        color: '#F4B942',
        isReadOnly: true,
        isAllDay: true,
      })),
      ...reminders.map((r) => ({
        id: `rem-${r.id}`,
        title: `[Reminder] ${r.title}`,
        startDate: r.dueDate.toISOString(),
        endDate: r.dueDate.toISOString(),
        source: 'reminder' as const,
        sourceId: r.id,
        color: '#DE8863',
        isReadOnly: true,
        isAllDay: false,
      })),
      ...subscriptions.map((s) => ({
        id: `sub-${s.id}`,
        title: `[Renewal] ${s.name}`,
        startDate: s.nextRenewalDate.toISOString(),
        endDate: s.nextRenewalDate.toISOString(),
        source: 'subscription' as const,
        sourceId: s.id,
        color: '#C04741',
        isReadOnly: true,
        isAllDay: true,
      })),
    ];

    return items.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  },
};
