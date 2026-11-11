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
