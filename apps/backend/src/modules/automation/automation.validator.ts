import { z } from 'zod';

const triggerTypeEnum = z.enum(['event', 'schedule', 'threshold']);
const actionTypeEnum = z.enum(['create_task', 'create_reminder', 'create_transaction', 'send_notification', 'update_status']);

const actionSchema = z.object({
  actionType: actionTypeEnum,
  config: z.record(z.unknown()),
  sortOrder: z.number().int().min(0).optional(),
});

export const createAutomationRuleSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  isActive: z.boolean().optional(),
  triggerType: triggerTypeEnum,
  triggerConfig: z.record(z.unknown()),
  conditions: z.array(z.record(z.unknown())).optional(),
  actions: z.array(actionSchema).min(1),
});

export const updateAutomationRuleSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  isActive: z.boolean().optional(),
  triggerType: triggerTypeEnum.optional(),
  triggerConfig: z.record(z.unknown()).optional(),
  conditions: z.array(z.record(z.unknown())).nullable().optional(),
  actions: z.array(actionSchema).optional(),
});

export const automationLogQuerySchema = z.object({
  ruleId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
