import { prisma } from '../../lib/prisma.js';

const CATEGORY_TYPE_VALUES = ['expense', 'income', 'task', 'event', 'reminder', 'subscription', 'project', 'knowledge', 'document'] as const;

const DEFAULT_CATEGORIES: Record<string, string[]> = {
  expense: [
    'Food & Dining', 'Groceries', 'Transport', 'Rent', 'Utilities',
    'Shopping', 'Entertainment', 'Health', 'Education', 'Subscriptions',
    'EMI', 'Personal Care', 'Travel', 'Gifts', 'Other',
  ],
  income: ['Salary', 'Freelance', 'Interest', 'Cashback', 'Gift', 'Reimbursement', 'Other'],
  task: ['Personal', 'Work', 'Learning', 'Finance', 'Health', 'Errands', 'Shopping'],
  event: ['Meeting', 'Personal', 'Birthday', 'Holiday', 'Deadline', 'Appointment'],
  reminder: ['Bill Payment', 'Subscription Renewal', 'Birthday', 'Anniversary', 'Document Expiry', 'Deadline', 'Custom'],
  subscription: ['Streaming', 'Software/Tools', 'Cloud/Storage', 'News/Media', 'Health/Fitness', 'Education', 'Gaming', 'Other'],
  project: ['Personal', 'Work', 'Learning', 'Side Project', 'Home', 'Finance', 'Health'],
  knowledge: ['Research', 'Learning', 'Personal', 'Work', 'Reference', 'Ideas', 'Archive'],
  document: ['Identity', 'Education', 'Employment', 'Financial', 'Insurance', 'Property', 'Medical', 'Warranties & Invoices', 'Contracts & Legal', 'Other'],
};

export async function seedDefaults() {
  const count = await prisma.category.count();
  if (count > 0) return;

  const rows: { name: string; type: string; isDefault: boolean; sortOrder: number }[] = [];
  for (const type of CATEGORY_TYPE_VALUES) {
    const names = DEFAULT_CATEGORIES[type];
    names.forEach((name, i) => {
      rows.push({ name, type, isDefault: true, sortOrder: i });
    });
  }

  await prisma.category.createMany({ data: rows });
}

export async function listByType(type: string) {
  return prisma.category.findMany({
    where: { type },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });
}

export async function listAll() {
  return prisma.category.findMany({
    orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
  });
}

export async function create(name: string, type: string) {
  const maxSort = await prisma.category.aggregate({
    where: { type },
    _max: { sortOrder: true },
  });
  const sortOrder = (maxSort._max.sortOrder ?? -1) + 1;

  return prisma.category.create({
    data: { name: name.trim(), type, sortOrder },
  });
}

export async function remove(id: string) {
  return prisma.category.delete({ where: { id } });
}
