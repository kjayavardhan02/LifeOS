import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error-handler.js';
import type { z } from 'zod';
import type {
  createGoalSchema,
  updateGoalSchema,
  goalQuerySchema,
  createGoalMilestoneSchema,
  updateGoalMilestoneSchema,
} from './goal.validator.js';

type CreateGoalInput = z.infer<typeof createGoalSchema>;
type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
type GoalQuery = z.infer<typeof goalQuerySchema>;
type CreateGoalMilestoneInput = z.infer<typeof createGoalMilestoneSchema>;
type UpdateGoalMilestoneInput = z.infer<typeof updateGoalMilestoneSchema>;

const goalListInclude = {
  _count: { select: { milestones: true, linkedTasks: true } },
};

const goalDetailInclude = {
  milestones: { orderBy: { sortOrder: 'asc' as const } },
  linkedTasks: {
    include: {
      task: {
        include: { subtasks: { orderBy: { sortOrder: 'asc' as const } } },
      },
    },
  },
  linkedHabits: {
    include: { habit: true },
  },
  _count: { select: { milestones: true, linkedTasks: true } },
};

function buildWhereClause(filters: Omit<GoalQuery, 'page' | 'limit' | 'sortBy' | 'sortOrder'>): Prisma.GoalWhereInput {
  const where: Prisma.GoalWhereInput = { deletedAt: null };

  if (filters.status) where.status = filters.status;
  if (filters.type) where.type = filters.type;
  if (filters.priority) where.priority = filters.priority;
  if (filters.category) where.category = filters.category;
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return where;
}

async function computeAutoProgress(goalId: string): Promise<number> {
  const [milestones, taskLinks] = await Promise.all([
    prisma.goalMilestone.findMany({ where: { goalId } }),
    prisma.goalTask.findMany({
      where: { goalId },
      include: { task: { select: { status: true } } },
    }),
  ]);

  const totalItems = milestones.length + taskLinks.length;
  if (totalItems === 0) return 0;

  const completedMilestones = milestones.filter((m) => m.status === 'completed').length;
  const completedTasks = taskLinks.filter((t) => t.task.status === 'done').length;

  return Math.round(((completedMilestones + completedTasks) / totalItems) * 100);
}

export const goalService = {
  async list(query: GoalQuery) {
    const { page, limit, sortBy, sortOrder, ...filters } = query;
    const where = buildWhereClause(filters);
    const skip = (page - 1) * limit;

    const orderBy: Prisma.GoalOrderByWithRelationInput = {};
    if (sortBy === 'priority') {
      orderBy.priority = sortOrder;
    } else {
      (orderBy as Record<string, string>)[sortBy] = sortOrder;
    }

    const [data, total] = await Promise.all([
      prisma.goal.findMany({
        where,
        include: goalListInclude,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.goal.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string) {
    const goal = await prisma.goal.findFirst({
      where: { id, deletedAt: null },
      include: goalDetailInclude,
    });
    if (!goal) throw new AppError(404, 'Goal not found');
    return goal;
  },

  async create(input: CreateGoalInput) {
    return prisma.goal.create({ data: input, include: goalListInclude });
  },

  async update(id: string, input: UpdateGoalInput) {
    await this.getById(id);
    const goal = await prisma.goal.update({
      where: { id },
      data: input,
      include: goalDetailInclude,
    });

    if (goal.progressMode === 'auto') {
      const progress = await computeAutoProgress(id);
      return prisma.goal.update({
        where: { id },
        data: { progress },
        include: goalDetailInclude,
      });
    }

    return goal;
  },

  async delete(id: string) {
    await this.getById(id);
    await prisma.goal.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  // Milestones
  async addMilestone(goalId: string, input: CreateGoalMilestoneInput) {
    await this.getById(goalId);
    const count = await prisma.goalMilestone.count({ where: { goalId } });
    const milestone = await prisma.goalMilestone.create({
      data: { ...input, goalId, sortOrder: count },
    });
    await this.refreshAutoProgress(goalId);
    return milestone;
  },

  async updateMilestone(goalId: string, milestoneId: string, input: UpdateGoalMilestoneInput) {
    await this.getById(goalId);
    const milestone = await prisma.goalMilestone.findFirst({
      where: { id: milestoneId, goalId },
    });
    if (!milestone) throw new AppError(404, 'Milestone not found');

    const updated = await prisma.goalMilestone.update({
      where: { id: milestoneId },
      data: input,
    });
    await this.refreshAutoProgress(goalId);
    return updated;
  },

  async deleteMilestone(goalId: string, milestoneId: string) {
    await this.getById(goalId);
    const milestone = await prisma.goalMilestone.findFirst({
      where: { id: milestoneId, goalId },
    });
    if (!milestone) throw new AppError(404, 'Milestone not found');
    await prisma.goalMilestone.delete({ where: { id: milestoneId } });
    await this.refreshAutoProgress(goalId);
  },

  // Task linking
  async linkTask(goalId: string, taskId: string) {
    await this.getById(goalId);
    const task = await prisma.task.findFirst({ where: { id: taskId, deletedAt: null } });
    if (!task) throw new AppError(404, 'Task not found');

    const existing = await prisma.goalTask.findUnique({
      where: { goalId_taskId: { goalId, taskId } },
    });
    if (existing) throw new AppError(400, 'Task already linked to this goal');

    await prisma.goalTask.create({ data: { goalId, taskId } });
    await this.refreshAutoProgress(goalId);
    return task;
  },

  async unlinkTask(goalId: string, taskId: string) {
    const existing = await prisma.goalTask.findUnique({
      where: { goalId_taskId: { goalId, taskId } },
    });
    if (!existing) throw new AppError(404, 'Task link not found');
    await prisma.goalTask.delete({ where: { goalId_taskId: { goalId, taskId } } });
    await this.refreshAutoProgress(goalId);
  },

  // Habit linking
  async linkHabit(goalId: string, habitId: string) {
    await this.getById(goalId);
    const habit = await prisma.habit.findFirst({ where: { id: habitId, deletedAt: null } });
    if (!habit) throw new AppError(404, 'Habit not found');

    const existing = await prisma.habitGoal.findUnique({
      where: { habitId_goalId: { habitId, goalId } },
    });
    if (existing) throw new AppError(400, 'Habit already linked to this goal');

    await prisma.habitGoal.create({ data: { habitId, goalId } });
    return habit;
  },

  async unlinkHabit(goalId: string, habitId: string) {
    const existing = await prisma.habitGoal.findUnique({
      where: { habitId_goalId: { habitId, goalId } },
    });
    if (!existing) throw new AppError(404, 'Habit link not found');
    await prisma.habitGoal.delete({ where: { habitId_goalId: { habitId, goalId } } });
  },

  async refreshAutoProgress(goalId: string) {
    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (goal && goal.progressMode === 'auto') {
      const progress = await computeAutoProgress(goalId);
      await prisma.goal.update({ where: { id: goalId }, data: { progress } });
    }
  },

  async getStats() {
    const [totalGoals, completedGoals, inProgressGoals, totalMilestones, completedMilestones] = await Promise.all([
      prisma.goal.count({ where: { deletedAt: null } }),
      prisma.goal.count({ where: { deletedAt: null, status: 'completed' } }),
      prisma.goal.count({ where: { deletedAt: null, status: 'in_progress' } }),
      prisma.goalMilestone.count({
        where: { goal: { deletedAt: null } },
      }),
      prisma.goalMilestone.count({
        where: { goal: { deletedAt: null }, status: 'completed' },
      }),
    ]);

    const avgProgress = totalGoals > 0
      ? Math.round((completedGoals * 100 + inProgressGoals * 50) / totalGoals)
      : 0;

    return {
      totalGoals,
      completedGoals,
      inProgressGoals,
      totalMilestones,
      completedMilestones,
      progress: avgProgress,
    };
  },
};
