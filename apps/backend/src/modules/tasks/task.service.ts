import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error-handler.js';
import type { z } from 'zod';
import type { createTaskSchema, updateTaskSchema, taskQuerySchema, createSubtaskSchema, updateSubtaskSchema } from './task.validator.js';

type CreateTaskInput = z.infer<typeof createTaskSchema>;
type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
type TaskQuery = z.infer<typeof taskQuerySchema>;
type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>;
type UpdateSubtaskInput = z.infer<typeof updateSubtaskSchema>;

const taskInclude = { subtasks: { orderBy: { sortOrder: 'asc' as const } } };

export const taskService = {
  async list(query: TaskQuery) {
    const { page, limit, sortBy, sortOrder, ...filters } = query;
    const where = buildWhereClause(filters);
    const skip = (page - 1) * limit;

    const orderBy: Prisma.TaskOrderByWithRelationInput = {};
    if (sortBy === 'priority') {
      orderBy.priority = sortOrder;
    } else {
      (orderBy as Record<string, string>)[sortBy] = sortOrder;
    }

    const [data, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: taskInclude,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.task.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const task = await prisma.task.findFirst({
      where: { id, deletedAt: null },
      include: taskInclude,
    });
    if (!task) throw new AppError(404, 'Task not found', 'NOT_FOUND');
    return task;
  },

  async create(input: CreateTaskInput) {
    const { subtasks, ...taskData } = input;
    return prisma.task.create({
      data: {
        ...taskData,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
        recurrenceEndDate: taskData.recurrenceEndDate ? new Date(taskData.recurrenceEndDate) : undefined,
        myDayDate: taskData.isMyDay ? new Date() : undefined,
        subtasks: subtasks?.length
          ? { create: subtasks.map((s, i) => ({ title: s.title, sortOrder: i })) }
          : undefined,
      },
      include: taskInclude,
    });
  },

  async update(id: string, input: UpdateTaskInput) {
    await this.getById(id);

    const data: Prisma.TaskUpdateInput = { ...input };

    if (input.dueDate !== undefined) {
      data.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    }
    if (input.recurrenceEndDate !== undefined) {
      data.recurrenceEndDate = input.recurrenceEndDate ? new Date(input.recurrenceEndDate) : null;
    }
    if (input.status === 'done') {
      data.completedAt = new Date();
    } else if (input.status) {
      data.completedAt = null;
    }
    if (input.isMyDay === true) {
      data.myDayDate = new Date();
    } else if (input.isMyDay === false) {
      data.myDayDate = null;
    }

    return prisma.task.update({
      where: { id },
      data,
      include: taskInclude,
    });
  },

  async delete(id: string) {
    await this.getById(id);
    await prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async addSubtask(taskId: string, input: CreateSubtaskInput) {
    await this.getById(taskId);
    const maxOrder = await prisma.subtask.aggregate({
      where: { taskId },
      _max: { sortOrder: true },
    });
    return prisma.subtask.create({
      data: {
        title: input.title,
        taskId,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
    });
  },

  async updateSubtask(taskId: string, subtaskId: string, input: UpdateSubtaskInput) {
    const subtask = await prisma.subtask.findFirst({
      where: { id: subtaskId, taskId },
    });
    if (!subtask) throw new AppError(404, 'Subtask not found', 'NOT_FOUND');

    return prisma.subtask.update({
      where: { id: subtaskId },
      data: input,
    });
  },

  async deleteSubtask(taskId: string, subtaskId: string) {
    const subtask = await prisma.subtask.findFirst({
      where: { id: subtaskId, taskId },
    });
    if (!subtask) throw new AppError(404, 'Subtask not found', 'NOT_FOUND');

    await prisma.subtask.delete({ where: { id: subtaskId } });
  },
};

function buildWhereClause(filters: Omit<TaskQuery, 'page' | 'limit' | 'sortBy' | 'sortOrder'>): Prisma.TaskWhereInput {
  const where: Prisma.TaskWhereInput = { deletedAt: null };

  if (filters.status) {
    where.status = Array.isArray(filters.status)
      ? { in: filters.status }
      : filters.status;
  }

  if (filters.priority) {
    where.priority = Array.isArray(filters.priority)
      ? { in: filters.priority }
      : filters.priority;
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.tags) {
    const tagList = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
    where.tags = { hasSome: tagList };
  }

  if (filters.isMyDay) {
    where.isMyDay = true;
    where.myDayDate = {
      gte: startOfDay(new Date()),
      lt: startOfDay(addDays(new Date(), 1)),
    };
  }

  if (filters.isOverdue) {
    where.dueDate = { lt: new Date() };
    where.status = { notIn: ['done', 'cancelled'] };
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { notes: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.dueDateFrom || filters.dueDateTo) {
    where.dueDate = {
      ...(where.dueDate as Prisma.DateTimeNullableFilter || {}),
      ...(filters.dueDateFrom ? { gte: new Date(filters.dueDateFrom) } : {}),
      ...(filters.dueDateTo ? { lte: new Date(filters.dueDateTo) } : {}),
    };
  }

  if (filters.projectId) {
    where.projectId = filters.projectId;
  }

  return where;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
