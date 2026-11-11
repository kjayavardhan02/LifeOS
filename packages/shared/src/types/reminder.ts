import type { Priority, RecurrencePattern } from './common.js';

export type ReminderStatus = 'pending' | 'snoozed' | 'done' | 'dismissed';

export type LinkedModule = 'tasks' | 'calendar' | 'subscriptions' | 'documents';

export interface Reminder {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  priority: Priority;
  category: string;
  status: ReminderStatus;
  isRecurring: boolean;
  recurrencePattern: RecurrencePattern | null;
  recurrenceEndDate: string | null;
  snoozedUntil: string | null;
  linkedModule: string | null;
  linkedItemId: string | null;
  notifyEmail: boolean;
  notifyBrowser: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReminderInput {
  title: string;
  description?: string;
  dueDate: string;
  priority?: Priority;
  category?: string;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
  recurrenceEndDate?: string;
  linkedModule?: string;
  linkedItemId?: string;
  notifyEmail?: boolean;
  notifyBrowser?: boolean;
}

export interface UpdateReminderInput {
  title?: string;
  description?: string | null;
  dueDate?: string;
  priority?: Priority;
  category?: string;
  status?: ReminderStatus;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern | null;
  recurrenceEndDate?: string | null;
  snoozedUntil?: string | null;
  linkedModule?: string | null;
  linkedItemId?: string | null;
  notifyEmail?: boolean;
  notifyBrowser?: boolean;
}

export interface ReminderFilters {
  status?: ReminderStatus | ReminderStatus[];
  priority?: Priority | Priority[];
  category?: string;
  search?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  isOverdue?: boolean;
  linkedModule?: string;
}
