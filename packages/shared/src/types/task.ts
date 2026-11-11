import type { Priority, RecurrencePattern } from './common.js';

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  sortOrder: number;
  taskId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  category: string;
  tags: string[];
  dueDate: string | null;
  estimatedMinutes: number | null;
  isMyDay: boolean;
  myDayDate: string | null;
  isRecurring: boolean;
  recurrencePattern: RecurrencePattern | null;
  recurrenceEndDate: string | null;
  notes: string | null;
  projectId: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  subtasks: Subtask[];
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  category?: string;
  tags?: string[];
  dueDate?: string;
  estimatedMinutes?: number;
  isMyDay?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
  recurrenceEndDate?: string;
  notes?: string;
  projectId?: string;
  subtasks?: { title: string }[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: Priority;
  category?: string;
  tags?: string[];
  dueDate?: string | null;
  estimatedMinutes?: number | null;
  isMyDay?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern | null;
  recurrenceEndDate?: string | null;
  notes?: string | null;
  projectId?: string | null;
}

export interface TaskFilters {
  status?: TaskStatus | TaskStatus[];
  priority?: Priority | Priority[];
  category?: string;
  tags?: string[];
  isMyDay?: boolean;
  isOverdue?: boolean;
  search?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  projectId?: string;
}
