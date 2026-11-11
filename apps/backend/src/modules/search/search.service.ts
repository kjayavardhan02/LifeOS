import { prisma } from '../../lib/prisma.js';
import type { z } from 'zod';
import type { searchQuerySchema } from './search.validator.js';

type SearchQueryInput = z.infer<typeof searchQuerySchema>;

type SearchModule =
  | 'tasks'
  | 'transactions'
  | 'events'
  | 'reminders'
  | 'projects'
  | 'notes'
  | 'documents'
  | 'subscriptions';

interface SearchTaskResult {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  updatedAt: string;
}

interface SearchTransactionResult {
  id: string;
  amount: number;
  type: string;
  category: string;
  merchant: string | null;
  date: string;
}

interface SearchEventResult {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
}

interface SearchReminderResult {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  status: string;
}

interface SearchProjectResult {
  id: string;
  name: string;
  description: string | null;
  status: string;
  updatedAt: string;
}

interface SearchNoteResult {
  id: string;
  title: string;
  content: string | null;
  folder: string;
  updatedAt: string;
}

interface SearchDocumentResult {
  id: string;
  name: string;
  description: string | null;
  category: string;
  updatedAt: string;
}

interface SearchSubscriptionResult {
  id: string;
  name: string;
  provider: string | null;
  amount: number;
  status: string;
  nextBillingDate: string;
}

interface SearchResults {
  tasks: SearchTaskResult[];
  transactions: SearchTransactionResult[];
  events: SearchEventResult[];
  reminders: SearchReminderResult[];
  projects: SearchProjectResult[];
  notes: SearchNoteResult[];
  documents: SearchDocumentResult[];
  subscriptions: SearchSubscriptionResult[];
  totalCount: number;
}

function truncate(text: string | null, maxLength: number): string | null {
  if (!text) return null;
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

async function searchTasks(query: string, limit: number, sortByDate: boolean): Promise<SearchTaskResult[]> {
  const tasks = await prisma.task.findMany({
    where: {
      deletedAt: null,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { notes: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      updatedAt: true,
    },
    orderBy: sortByDate ? { updatedAt: 'desc' } : undefined,
    take: limit,
  });

  return tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: truncate(t.description, 150),
    status: t.status,
    priority: t.priority,
    updatedAt: t.updatedAt.toISOString(),
  }));
}

async function searchTransactions(query: string, limit: number, sortByDate: boolean): Promise<SearchTransactionResult[]> {
  const transactions = await prisma.financeTransaction.findMany({
    where: {
      deletedAt: null,
      OR: [
        { category: { contains: query, mode: 'insensitive' } },
        { merchant: { contains: query, mode: 'insensitive' } },
        { notes: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      amount: true,
      type: true,
      category: true,
      merchant: true,
      date: true,
    },
    orderBy: sortByDate ? { date: 'desc' } : undefined,
    take: limit,
  });

  return transactions.map((t) => ({
    id: t.id,
    amount: t.amount,
    type: t.type,
    category: t.category,
    merchant: t.merchant,
    date: t.date.toISOString(),
  }));
}

async function searchEvents(query: string, limit: number, sortByDate: boolean): Promise<SearchEventResult[]> {
  const events = await prisma.calendarEvent.findMany({
    where: {
      deletedAt: null,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { location: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      startDate: true,
    },
    orderBy: sortByDate ? { startDate: 'desc' } : undefined,
    take: limit,
  });

  return events.map((e) => ({
    id: e.id,
    title: e.title,
    description: truncate(e.description, 150),
    startDate: e.startDate.toISOString(),
  }));
}

async function searchReminders(query: string, limit: number, sortByDate: boolean): Promise<SearchReminderResult[]> {
  const reminders = await prisma.reminder.findMany({
    where: {
      deletedAt: null,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      dueDate: true,
      status: true,
    },
    orderBy: sortByDate ? { dueDate: 'desc' } : undefined,
    take: limit,
  });

  return reminders.map((r) => ({
    id: r.id,
    title: r.title,
    description: truncate(r.description, 150),
    dueDate: r.dueDate.toISOString(),
    status: r.status,
  }));
}

async function searchProjects(query: string, limit: number, sortByDate: boolean): Promise<SearchProjectResult[]> {
  const projects = await prisma.project.findMany({
    where: {
      deletedAt: null,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      updatedAt: true,
    },
    orderBy: sortByDate ? { updatedAt: 'desc' } : undefined,
    take: limit,
  });

  return projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: truncate(p.description, 150),
    status: p.status,
    updatedAt: p.updatedAt.toISOString(),
  }));
}

async function searchNotes(query: string, limit: number, sortByDate: boolean): Promise<SearchNoteResult[]> {
  const notes = await prisma.knowledgeNote.findMany({
    where: {
      deletedAt: null,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      title: true,
      content: true,
      folder: true,
      updatedAt: true,
    },
    orderBy: sortByDate ? { updatedAt: 'desc' } : undefined,
    take: limit,
  });

  return notes.map((n) => ({
    id: n.id,
    title: n.title,
    content: truncate(n.content, 150),
    folder: n.folder,
    updatedAt: n.updatedAt.toISOString(),
  }));
}

async function searchDocuments(query: string, limit: number, sortByDate: boolean): Promise<SearchDocumentResult[]> {
  const documents = await prisma.document.findMany({
    where: {
      deletedAt: null,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { notes: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      updatedAt: true,
    },
    orderBy: sortByDate ? { updatedAt: 'desc' } : undefined,
    take: limit,
  });

  return documents.map((d) => ({
    id: d.id,
    name: d.name,
    description: truncate(d.description, 150),
    category: d.category,
    updatedAt: d.updatedAt.toISOString(),
  }));
}

async function searchSubscriptions(query: string, limit: number, sortByDate: boolean): Promise<SearchSubscriptionResult[]> {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      deletedAt: null,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { provider: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      provider: true,
      amount: true,
      status: true,
      nextRenewalDate: true,
    },
    orderBy: sortByDate ? { nextRenewalDate: 'desc' } : undefined,
    take: limit,
  });

  return subscriptions.map((s) => ({
    id: s.id,
    name: s.name,
    provider: s.provider,
    amount: s.amount,
    status: s.status,
    nextBillingDate: s.nextRenewalDate.toISOString(),
  }));
}

type SearchFn<T> = (query: string, limit: number, sortByDate: boolean) => Promise<T[]>;

const MODULE_SEARCH_MAP: Record<SearchModule, SearchFn<unknown>> = {
  tasks: searchTasks,
  transactions: searchTransactions,
  events: searchEvents,
  reminders: searchReminders,
  projects: searchProjects,
  notes: searchNotes,
  documents: searchDocuments,
  subscriptions: searchSubscriptions,
};

export const searchService = {
  async search(params: SearchQueryInput): Promise<SearchResults> {
    const { q, module, sortBy, limit } = params;
    const sortByDate = sortBy === 'date';

    const emptyResults: SearchResults = {
      tasks: [],
      transactions: [],
      events: [],
      reminders: [],
      projects: [],
      notes: [],
      documents: [],
      subscriptions: [],
      totalCount: 0,
    };

    if (module) {
      const searchFn = MODULE_SEARCH_MAP[module];
      const results = await searchFn(q, limit, sortByDate);
      return {
        ...emptyResults,
        [module]: results,
        totalCount: results.length,
      };
    }

    // Search all modules in parallel
    const [tasks, transactions, events, reminders, projects, notes, documents, subscriptions] =
      await Promise.all([
        searchTasks(q, limit, sortByDate),
        searchTransactions(q, limit, sortByDate),
        searchEvents(q, limit, sortByDate),
        searchReminders(q, limit, sortByDate),
        searchProjects(q, limit, sortByDate),
        searchNotes(q, limit, sortByDate),
        searchDocuments(q, limit, sortByDate),
        searchSubscriptions(q, limit, sortByDate),
      ]);

    const totalCount =
      tasks.length +
      transactions.length +
      events.length +
      reminders.length +
      projects.length +
      notes.length +
      documents.length +
      subscriptions.length;

    return {
      tasks,
      transactions,
      events,
      reminders,
      projects,
      notes,
      documents,
      subscriptions,
      totalCount,
    };
  },
};
