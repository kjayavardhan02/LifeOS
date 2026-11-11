import type { Priority } from './common.js';
import type { Task } from './task.js';

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed';

export interface Milestone {
  id: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  status: MilestoneStatus;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: Priority;
  category: string;
  tags: string[];
  color: string;
  startDate: string | null;
  targetEndDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  milestones: Milestone[];
  tasks: Task[];
  _count?: { tasks: number; milestones: number };
}

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  totalMilestones: number;
  completedMilestones: number;
  progress: number;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  status?: ProjectStatus;
  priority?: Priority;
  category?: string;
  tags?: string[];
  color?: string;
  startDate?: string;
  targetEndDate?: string;
  notes?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
  priority?: Priority;
  category?: string;
  tags?: string[];
  color?: string;
  startDate?: string | null;
  targetEndDate?: string | null;
  notes?: string | null;
}

export interface CreateMilestoneInput {
  title: string;
  description?: string;
  targetDate?: string;
}

export interface UpdateMilestoneInput {
  title?: string;
  description?: string | null;
  targetDate?: string | null;
  status?: MilestoneStatus;
}

export interface ProjectFilters {
  status?: ProjectStatus;
  priority?: Priority;
  category?: string;
  search?: string;
}
