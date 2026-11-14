import cron from 'node-cron';
import { prisma } from '../../lib/prisma.js';
import { eventBus, type EventName } from '../../lib/event-bus.js';
import { sendEmail } from '../../lib/mailer.js';
import { taskService } from '../tasks/task.service.js';
import { reminderService } from '../reminders/reminder.service.js';
import { logger } from '../../lib/logger.js';
import type { AutomationRule, AutomationAction } from '@prisma/client';

type RuleWithActions = AutomationRule & { actions: AutomationAction[] };

const cronJobs = new Map<string, cron.ScheduledTask>();

export async function initializeAutomationEngine(): Promise<void> {
  const rules = await prisma.automationRule.findMany({
    where: { isActive: true, deletedAt: null },
    include: { actions: { orderBy: { sortOrder: 'asc' } } },
  });

  for (const rule of rules) {
    registerRule(rule);
  }

  logger.info(`[AutomationEngine] Initialized with ${rules.length} active rules`);
}

export function registerRule(rule: RuleWithActions): void {
  if (rule.triggerType === 'event') {
    registerEventRule(rule);
  } else if (rule.triggerType === 'schedule') {
    registerScheduleRule(rule);
  }
}

export function unregisterRule(ruleId: string): void {
  const job = cronJobs.get(ruleId);
  if (job) {
    job.stop();
    cronJobs.delete(ruleId);
  }
}

function registerEventRule(rule: RuleWithActions): void {
  const config = rule.triggerConfig as { eventName?: string };
  if (!config.eventName) return;

  eventBus.on(config.eventName as EventName, async (payload: Record<string, unknown>) => {
    const freshRule = await prisma.automationRule.findFirst({
      where: { id: rule.id, isActive: true, deletedAt: null },
      include: { actions: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!freshRule) return;

    if (evaluateConditions(freshRule.conditions, payload)) {
      await executeActions(freshRule, payload, { eventName: config.eventName });
    }
  });
}

function registerScheduleRule(rule: RuleWithActions): void {
  const config = rule.triggerConfig as { cron?: string };
  if (!config.cron || !cron.validate(config.cron)) {
    logger.warn(`[AutomationEngine] Invalid cron for rule ${rule.id}: ${config.cron}`);
    return;
  }

  const job = cron.schedule(config.cron, async () => {
    const freshRule = await prisma.automationRule.findFirst({
      where: { id: rule.id, isActive: true, deletedAt: null },
      include: { actions: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!freshRule) {
      job.stop();
      cronJobs.delete(rule.id);
      return;
    }
    await executeActions(freshRule, { triggeredAt: new Date().toISOString() }, { cron: config.cron });
  });

  cronJobs.set(rule.id, job);
}

function evaluateConditions(conditions: unknown, payload: Record<string, unknown>): boolean {
  if (!conditions || !Array.isArray(conditions) || conditions.length === 0) return true;

  for (const cond of conditions) {
    const { field, op, value } = cond as { field: string; op: string; value: unknown };
    const actual = getNestedValue(payload, field);

    switch (op) {
      case 'eq': if (actual !== value) return false; break;
      case 'neq': if (actual === value) return false; break;
      case 'gt': if (Number(actual) <= Number(value)) return false; break;
      case 'gte': if (Number(actual) < Number(value)) return false; break;
      case 'lt': if (Number(actual) >= Number(value)) return false; break;
      case 'lte': if (Number(actual) > Number(value)) return false; break;
      case 'contains':
        if (typeof actual !== 'string' || !actual.includes(String(value))) return false;
        break;
      default: break;
    }
  }
  return true;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((curr, key) => {
    if (curr && typeof curr === 'object') return (curr as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

function resolveTemplates(config: unknown, context: Record<string, unknown>): Record<string, unknown> {
  const str = JSON.stringify(config);
  const resolved = str.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_match, path: string) => {
    const value = getNestedValue(context, path);
    return String(value ?? '');
  });
  return JSON.parse(resolved);
}

function resolveDateOffset(value: string): string {
  const match = value.match(/^([+-]\d+)([dhm])$/);
  if (!match) return value;

  const amount = parseInt(match[1]!);
  const unit = match[2]!;
  const d = new Date();

  switch (unit) {
    case 'd': d.setDate(d.getDate() + amount); break;
    case 'h': d.setHours(d.getHours() + amount); break;
    case 'm': d.setMinutes(d.getMinutes() + amount); break;
  }
  return d.toISOString();
}

async function executeActions(
  rule: RuleWithActions,
  context: Record<string, unknown>,
  triggerMeta?: Record<string, unknown>,
): Promise<void> {
  const actionResults: unknown[] = [];
  let status = 'success';
  let error: string | undefined;

  try {
    for (const action of rule.actions) {
      const resolved = resolveTemplates(action.config, context);

      switch (action.actionType) {
        case 'create_task': {
          const dueDate = resolved['dueDate'] as string | undefined;
          await taskService.create({
            title: resolved['title'] as string,
            description: resolved['description'] as string | undefined,
            priority: (resolved['priority'] as 'low' | 'medium' | 'high' | 'urgent') ?? 'medium',
            category: resolved['category'] as string | undefined,
            dueDate: dueDate ? resolveDateOffset(dueDate) : undefined,
          });
          actionResults.push({ type: 'create_task', title: resolved['title'] });
          break;
        }
        case 'create_reminder': {
          const dueDate = (resolved['dueDate'] as string) ?? resolveDateOffset('+1d');
          await reminderService.create({
            title: resolved['title'] as string,
            description: resolved['description'] as string | undefined,
            dueDate: resolveDateOffset(dueDate),
            priority: (resolved['priority'] as 'low' | 'medium' | 'high' | 'urgent') ?? 'medium',
            category: resolved['category'] as string | undefined,
          });
          actionResults.push({ type: 'create_reminder', title: resolved['title'] });
          break;
        }
        case 'create_transaction': {
          await prisma.financeTransaction.create({
            data: {
              amount: Number(resolved['amount']),
              type: (resolved['type'] as 'income' | 'expense' | 'transfer') ?? 'expense',
              date: new Date(),
              category: resolved['category'] as string,
              paymentMethod: (resolved['paymentMethod'] as string) ?? 'Cash',
              merchant: resolved['merchant'] as string | undefined,
              notes: resolved['notes'] as string | undefined,
            },
          });
          actionResults.push({ type: 'create_transaction', amount: resolved['amount'] });
          break;
        }
        case 'send_notification': {
          const user = await prisma.user.findFirst();
          if (user) {
            await sendEmail(
              user.email,
              resolved['subject'] as string || `LifeOS Automation: ${rule.name}`,
              resolved['body'] as string || `Rule "${rule.name}" was triggered.`,
            );
          }
          actionResults.push({ type: 'send_notification' });
          break;
        }
        case 'update_status': {
          // Generic status update — needs module + id + status
          const module = resolved['module'] as string;
          const itemId = resolved['itemId'] as string;
          const newStatus = resolved['status'] as string;
          if (module === 'tasks' && itemId && newStatus) {
            await taskService.update(itemId, { status: newStatus as 'todo' | 'in_progress' | 'done' | 'cancelled' });
          }
          actionResults.push({ type: 'update_status', module, itemId, newStatus });
          break;
        }
      }
    }
  } catch (err) {
    status = 'failed';
    error = err instanceof Error ? err.message : String(err);
    logger.error(`[AutomationEngine] Rule "${rule.name}" failed:`, err);
  }

  await prisma.automationLog.create({
    data: {
      ruleId: rule.id,
      ruleName: rule.name,
      trigger: { ...context, ...triggerMeta },
      actions: actionResults as unknown[],
      status,
      error,
    },
  });

  await prisma.automationRule.update({
    where: { id: rule.id },
    data: {
      lastTriggeredAt: new Date(),
      triggerCount: { increment: 1 },
    },
  });

  logger.info(`[AutomationEngine] Rule "${rule.name}" executed: ${status}`);
}
