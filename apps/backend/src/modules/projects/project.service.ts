import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error-handler.js';
import type { z } from 'zod';
import type {
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
  createMilestoneSchema,
  updateMilestoneSchema,
} from './project.validator.js';

type CreateProjectInput = z.infer<typeof createProjectSchema>;
type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
type ProjectQuery = z.infer<typeof projectQuerySchema>;
type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;

const projectListInclude = {
  _count: { select: { tasks: true, milestones: true } },
};

const projectDetailInclude = {
  milestones: { orderBy: { createdAt: 'asc' as const } },
  tasks: {
    where: { deletedAt: null },
    include: { subtasks: { orderBy: { sortOrder: 'asc' as const } } },
    orderBy: { createdAt: 'desc' as const },
  },
  _count: { select: { tasks: true, milestones: true } },
};

export const projectService = {
  async list(query: ProjectQuery) {
    const { page, limit, sortBy, sortOrder, ...filters } = query;
    const where = buildWhereClause(filters);
    const skip = (page - 1) * limit;

    const orderBy: Prisma.ProjectOrderByWithRelationInput = {};
    if (sortBy === 'priority') {
      orderBy.priority = sortOrder;
    } else {
      (orderBy as Record<string, string>)[sortBy] = sortOrder;
    }

    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: projectListInclude,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.project.count({ where }),
    ]);

    // Compute task completion stats for each project
    const enriched = await Promise.all(
      data.map(async (project) => {
        const taskStats = await prisma.task.groupBy({
          by: ['status'],
          where: { projectId: project.id, deletedAt: null },
          _count: true,
        });
        const totalTasks = taskStats.reduce((sum, s) => sum + s._count, 0);
        const completedTasks = taskStats
          .filter((s) => s.status === 'done')
          .reduce((sum, s) => sum + s._count, 0);
        return {
          ...project,
          taskStats: { totalTasks, completedTasks },
        };
      }),
    );

    return {
      data: enriched,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const project = await prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: projectDetailInclude,
    });
    if (!project) throw new AppError(404, 'Project not found', 'NOT_FOUND');
    return project;
  },

  async create(input: CreateProjectInput) {
    return prisma.project.create({
      data: {
        ...input,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        targetEndDate: input.targetEndDate ? new Date(input.targetEndDate) : undefined,
      },
      include: projectDetailInclude,
    });
  },

  async update(id: string, input: UpdateProjectInput) {
    await this.getById(id);

    const data: Prisma.ProjectUpdateInput = { ...input };

    if (input.startDate !== undefined) {
      data.startDate = input.startDate ? new Date(input.startDate) : null;
    }
    if (input.targetEndDate !== undefined) {
      data.targetEndDate = input.targetEndDate ? new Date(input.targetEndDate) : null;
    }

    return prisma.project.update({
      where: { id },
      data,
      include: projectDetailInclude,
    });
  },

  async delete(id: string) {
    await this.getById(id);
    await prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  // Milestones
  async addMilestone(projectId: string, input: CreateMilestoneInput) {
    await this.getById(projectId);
    return prisma.milestone.create({
      data: {
        title: input.title,
        description: input.description,
        targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
        projectId,
      },
    });
  },

  async updateMilestone(projectId: string, milestoneId: string, input: UpdateMilestoneInput) {
    const milestone = await prisma.milestone.findFirst({
      where: { id: milestoneId, projectId },
    });
    if (!milestone) throw new AppError(404, 'Milestone not found', 'NOT_FOUND');

    const data: Prisma.MilestoneUpdateInput = { ...input };
    if (input.targetDate !== undefined) {
      data.targetDate = input.targetDate ? new Date(input.targetDate) : null;
    }

    return prisma.milestone.update({
      where: { id: milestoneId },
      data,
    });
  },

  async deleteMilestone(projectId: string, milestoneId: string) {
    const milestone = await prisma.milestone.findFirst({
      where: { id: milestoneId, projectId },
    });
    if (!milestone) throw new AppError(404, 'Milestone not found', 'NOT_FOUND');

    await prisma.milestone.delete({ where: { id: milestoneId } });
  },

  // Task linking
  async linkTask(projectId: string, taskId: string) {
    await this.getById(projectId);
    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
    });
    if (!task) throw new AppError(404, 'Task not found', 'NOT_FOUND');

    return prisma.task.update({
      where: { id: taskId },
      data: { projectId },
    });
  },

  async unlinkTask(projectId: string, taskId: string) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId, deletedAt: null },
    });
    if (!task) throw new AppError(404, 'Task not linked to this project', 'NOT_FOUND');

    return prisma.task.update({
      where: { id: taskId },
      data: { projectId: null },
    });
  },

  // Stats
  async getStats(id: string) {
    await this.getById(id);

    const [taskStats, milestoneStats] = await Promise.all([
      prisma.task.groupBy({
        by: ['status'],
        where: { projectId: id, deletedAt: null },
        _count: true,
      }),
      prisma.milestone.groupBy({
        by: ['status'],
        where: { projectId: id },
        _count: true,
      }),
    ]);

    const totalTasks = taskStats.reduce((sum, s) => sum + s._count, 0);
    const completedTasks = taskStats
      .filter((s) => s.status === 'done')
      .reduce((sum, s) => sum + s._count, 0);

    const totalMilestones = milestoneStats.reduce((sum, s) => sum + s._count, 0);
    const completedMilestones = milestoneStats
      .filter((s) => s.status === 'completed')
      .reduce((sum, s) => sum + s._count, 0);

    const totalItems = totalTasks + totalMilestones;
    const completedItems = completedTasks + completedMilestones;
    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      totalMilestones,
      completedMilestones,
      progress,
    };
  },
};

function buildWhereClause(
  filters: Omit<ProjectQuery, 'page' | 'limit' | 'sortBy' | 'sortOrder'>,
): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = { deletedAt: null };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.priority) {
    where.priority = filters.priority;
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { notes: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return where;
}
