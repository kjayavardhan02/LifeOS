import type { Priority } from './common.js';

export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'abandoned';
export type GoalType = 'short_term' | 'long_term';
export type HabitFrequency = 'daily' | 'specific_days' | 'weekly' | 'monthly';

export interface GoalMilestone {
  id: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  sortOrder: number;
  goalId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalTask {
  goalId: string;
  taskId: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  type: GoalType;
  status: GoalStatus;
  priority: Priority;
  category: string;
  tags: string[];
  targetDate: string | null;
  progress: number;
  progressMode: string;
  notes: string | null;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
  milestones: GoalMilestone[];
  linkedTasks: Array<GoalTask & { task: import('./task.js').Task }>;
  _count?: { milestones: number; linkedTasks: number };
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  type?: GoalType;
  status?: GoalStatus;
  priority?: Priority;
  category?: string;
  tags?: string[];
  targetDate?: string;
  progress?: number;
  progressMode?: string;
  notes?: string;
  projectId?: string;
}

export interface UpdateGoalInput {
  title?: string;
  description?: string | null;
  type?: GoalType;
  status?: GoalStatus;
  priority?: Priority;
  category?: string;
  tags?: string[];
  targetDate?: string | null;
  progress?: number;
  progressMode?: string;
  notes?: string | null;
  projectId?: string | null;
}

export interface GoalFilters {
  status?: GoalStatus;
  type?: GoalType;
  priority?: Priority;
  category?: string;
  search?: string;
}

export interface GoalStats {
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  totalMilestones: number;
  completedMilestones: number;
  progress: number;
}

export interface Habit {
  id: string;
  name: string;
  description: string | null;
  frequency: HabitFrequency;
  targetDays: string[];
  targetCount: number;
  unit: string | null;
  category: string;
  color: string;
  isArchived: boolean;
  streakCurrent: number;
  streakLongest: number;
  streakFreezes: number;
  freezesUsed: number;
  freezeResetAt: string | null;
  createdAt: string;
  updatedAt: string;
  logs?: HabitLog[];
  todayLog?: HabitLog | null;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  value: number;
  note: string | null;
  createdAt: string;
}

export interface CreateHabitInput {
  name: string;
  description?: string;
  frequency?: HabitFrequency;
  targetDays?: string[];
  targetCount?: number;
  unit?: string;
  category?: string;
  color?: string;
}

export interface UpdateHabitInput {
  name?: string;
  description?: string | null;
  frequency?: HabitFrequency;
  targetDays?: string[];
  targetCount?: number;
  unit?: string | null;
  category?: string;
  color?: string;
  isArchived?: boolean;
}

export interface HabitFilters {
  category?: string;
  isArchived?: boolean;
  search?: string;
}

export interface HabitStats {
  totalHabits: number;
  activeHabits: number;
  completedToday: number;
  longestStreak: number;
  currentBestStreak: number;
}

export interface CreateGoalMilestoneInput {
  title: string;
  description?: string;
  targetDate?: string;
}

export interface UpdateGoalMilestoneInput {
  title?: string;
  description?: string | null;
  targetDate?: string | null;
  status?: 'pending' | 'in_progress' | 'completed';
}
