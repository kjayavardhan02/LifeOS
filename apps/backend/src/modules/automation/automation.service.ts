import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error-handler.js';
import type { z } from 'zod';
import type { createAutomationRuleSchema, updateAutomationRuleSchema, automationLogQuerySchema } from './automation.validator.js';
import type { Prisma } from '@prisma/client';

type CreateRuleInput = z.infer<typeof createAutomationRuleSchema>;
type UpdateRuleInput = z.infer<typeof updateAutomationRuleSchema>;
type LogQuery = z.infer<typeof automationLogQuerySchema>;

const ruleInclude = {
  actions: { orderBy: { sortOrder: 'asc' as const } },
};

export const automationService = {
  async listRules() {
    const rules = await prisma.automationRule.findMany({
      where: { deletedAt: null },
      include: ruleInclude,
      orderBy: { createdAt: 'desc' },
    });
    return { data: rules };
  },

  async getRuleById(id: string) {
    const rule = await prisma.automationRule.findFirst({
      where: { id, deletedAt: null },
      include: ruleInclude,
    });
    if (!rule) throw new AppError(404, 'Automation rule not found', 'NOT_FOUND');
    return rule;
  },

  async createRule(input: CreateRuleInput) {
    const { actions, ...ruleData } = input;
    return prisma.automationRule.create({
      data: {
        ...ruleData,
        triggerConfig: ruleData.triggerConfig as Prisma.InputJsonValue,
        conditions: ruleData.conditions as Prisma.InputJsonValue ?? undefined,
        actions: {
          create: actions.map((a, i) => ({
            actionType: a.actionType,
            config: a.config as Prisma.InputJsonValue,
            sortOrder: a.sortOrder ?? i,
          })),
        },
      },
      include: ruleInclude,
    });
  },

  async updateRule(id: string, input: UpdateRuleInput) {
    await this.getRuleById(id);

    const { actions, ...ruleData } = input;
    const data: Prisma.AutomationRuleUpdateInput = {};

    if (ruleData.name !== undefined) data.name = ruleData.name;
    if (ruleData.description !== undefined) data.description = ruleData.description;
    if (ruleData.isActive !== undefined) data.isActive = ruleData.isActive;
    if (ruleData.triggerType !== undefined) data.triggerType = ruleData.triggerType;
    if (ruleData.triggerConfig !== undefined) data.triggerConfig = ruleData.triggerConfig as Prisma.InputJsonValue;
    if (ruleData.conditions !== undefined) data.conditions = ruleData.conditions as Prisma.InputJsonValue ?? Prisma.DbNull;

    if (actions) {
      await prisma.automationAction.deleteMany({ where: { ruleId: id } });
      await prisma.automationAction.createMany({
        data: actions.map((a, i) => ({
          ruleId: id,
          actionType: a.actionType,
          config: a.config as Prisma.InputJsonValue,
          sortOrder: a.sortOrder ?? i,
        })),
      });
    }

    await prisma.automationRule.update({ where: { id }, data });
    return this.getRuleById(id);
  },

  async deleteRule(id: string) {
    await this.getRuleById(id);
    await prisma.automationRule.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async listLogs(query: LogQuery) {
    const { page, limit, ruleId } = query;
    const where: Prisma.AutomationLogWhereInput = {};
    if (ruleId) where.ruleId = ruleId;

    const [data, total] = await Promise.all([
      prisma.automationLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.automationLog.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getActiveRules() {
    return prisma.automationRule.findMany({
      where: { isActive: true, deletedAt: null },
      include: ruleInclude,
    });
  },
};
