import type { RecurrencePattern } from './common.js';

export type EventCategory =
  | 'Meeting'
  | 'Personal'
  | 'Birthday'
  | 'Holiday'
  | 'Deadline'
  | 'Appointment';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  location: string | null;
  category: string;
  color: string;
  isAllDay: boolean;
  isRecurring: boolean;
  recurrencePattern: RecurrencePattern | null;
  recurrenceEndDate: string | null;
  reminderMinutes: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  category?: string;
  color?: string;
  isAllDay?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
  recurrenceEndDate?: string;
  reminderMinutes?: number;
}

export interface UpdateEventInput {
  title?: string;
  description?: string | null;
  startDate?: string;
  endDate?: string;
  location?: string | null;
  category?: string;
  color?: string;
  isAllDay?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern | null;
  recurrenceEndDate?: string | null;
  reminderMinutes?: number | null;
}

export interface EventFilters {
  category?: string;
  startFrom?: string;
  startTo?: string;
  isAllDay?: boolean;
  search?: string;
}

export type CalendarFeedSource = 'event' | 'task' | 'reminder' | 'subscription';

export interface CalendarFeedItem {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  source: CalendarFeedSource;
  sourceId: string;
  color: string;
  isReadOnly: boolean;
  isAllDay: boolean;
}

export interface LifeContextSnapshot {
  todayTasks: Array<{ id: string; title: string; dueDate: string | null; status: string; priority: string }>;
  overdueTasks: Array<{ id: string; title: string; dueDate: string | null; status: string; priority: string }>;
  activeReminders: Array<{ id: string; title: string; dueDate: string; priority: string; category: string }>;
  upcomingEvents: Array<{ id: string; title: string; startDate: string; endDate: string; category: string }>;
  upcomingRenewals: Array<{ id: string; name: string; amount: number; nextRenewalDate: string; billingCycle: string }>;
  recentTransactions: Array<{ id: string; amount: number; type: string; category: string; date: string; merchant: string | null }>;
  activeGoals: Array<{ id: string; title: string; progress: number; status: string }>;
  expiringDocuments: Array<{ id: string; name: string; expiryDate: string; category: string }>;
}
