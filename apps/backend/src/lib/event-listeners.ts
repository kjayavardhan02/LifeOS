import { eventBus } from './event-bus.js';
import { prisma } from './prisma.js';
import { goalService } from '../modules/goals/goal.service.js';
import { logger } from './logger.js';

function registerTaskListeners(): void {
  eventBus.on('task.completed', async (payload) => {
    for (const goalId of payload.goalIds) {
      await goalService.refreshAutoProgress(goalId);
    }
  });

  eventBus.on('task.updated', async (payload) => {
    if (payload.newStatus && payload.newStatus !== payload.previousStatus) {
      const goalIds = payload.changes['goalIds'] as string[] | undefined;
      if (goalIds) {
        for (const goalId of goalIds) {
          await goalService.refreshAutoProgress(goalId);
        }
      }
    }
  });
}

function registerSubscriptionListeners(): void {
  eventBus.on('subscription.created', async (payload) => {
    for (const daysBefore of payload.reminderDaysBefore) {
      const renewalDate = new Date(payload.nextRenewalDate);
      const reminderDate = new Date(renewalDate);
      reminderDate.setDate(reminderDate.getDate() - daysBefore);

      if (reminderDate > new Date()) {
        await prisma.reminder.create({
          data: {
            title: `${payload.name} renewal in ${daysBefore} day${daysBefore > 1 ? 's' : ''}`,
            description: `Amount: ₹${payload.amount} (${payload.billingCycle})`,
            dueDate: reminderDate,
            category: 'Subscription Renewal',
            priority: 'medium',
            linkedModule: 'subscriptions',
            linkedItemId: payload.subscriptionId,
            notifyEmail: true,
            notifyBrowser: true,
          },
        });
        logger.info(`[EventBus] Auto-created reminder for subscription ${payload.name}`);
      }
    }
  });
}

function registerDocumentListeners(): void {
  eventBus.on('document.created', async (payload) => {
    if (payload.expiryDate) {
      const expiryDate = new Date(payload.expiryDate);
      const reminderDate = new Date(expiryDate);
      reminderDate.setDate(reminderDate.getDate() - 30);
      const now = new Date();
      const dueDate = reminderDate > now ? reminderDate : expiryDate;

      await prisma.reminder.create({
        data: {
          title: `Document expiring: ${payload.name}`,
          description: `${payload.category} document expires on ${expiryDate.toLocaleDateString()}`,
          dueDate,
          category: 'Document Expiry',
          priority: 'high',
          linkedModule: 'documents',
          linkedItemId: payload.documentId,
          notifyEmail: true,
          notifyBrowser: true,
        },
      });
      logger.info(`[EventBus] Auto-created expiry reminder for document ${payload.name}`);
    }
  });
}

function registerGoalListeners(): void {
  eventBus.on('goal.completed', async (payload) => {
    logger.info(`[EventBus] Goal completed: ${payload.title}`);
  });
}

export function registerEventListeners(): void {
  registerTaskListeners();
  registerSubscriptionListeners();
  registerDocumentListeners();
  registerGoalListeners();

  logger.info('[EventBus] All event listeners registered');
}
