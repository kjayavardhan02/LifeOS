import { EventEmitter } from 'events';
import { logger } from './logger.js';

interface DomainEvents {
  'task.created': { taskId: string; title: string; dueDate: string | null; projectId: string | null };
  'task.updated': { taskId: string; changes: Record<string, unknown>; previousStatus?: string; newStatus?: string };
  'task.completed': { taskId: string; title: string; goalIds: string[] };
  'task.deleted': { taskId: string };

  'subscription.created': { subscriptionId: string; name: string; nextRenewalDate: string; reminderDaysBefore: number[]; amount: number; billingCycle: string; category: string };
  'subscription.renewed': { subscriptionId: string; name: string; amount: number; nextRenewalDate: string; billingCycle: string; category: string; paymentMethod: string };
  'subscription.updated': { subscriptionId: string; changes: Record<string, unknown> };
  'subscription.cancelled': { subscriptionId: string; name: string };

  'document.created': { documentId: string; name: string; expiryDate: string | null; category: string };
  'document.updated': { documentId: string; changes: Record<string, unknown>; expiryDate?: string | null };

  'reminder.due': { reminderId: string; title: string; notifyEmail: boolean; notifyBrowser: boolean };
  'reminder.created': { reminderId: string; title: string; linkedModule: string | null; linkedItemId: string | null };

  'transaction.created': { transactionId: string; amount: number; type: string; category: string; subscriptionId?: string };

  'habit.logged': { habitId: string; date: string; value: number };
  'habit.streak.broken': { habitId: string; name: string; previousStreak: number };

  'goal.progress.changed': { goalId: string; previousProgress: number; newProgress: number };
  'goal.completed': { goalId: string; title: string };

  'calendar.event.created': { eventId: string; title: string; startDate: string };
}

type EventName = keyof DomainEvents;

class DomainEventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(50);
  }

  emit<E extends EventName>(event: E, payload: DomainEvents[E]): void {
    logger.info(`[EventBus] ${event}`);
    this.emitter.emit(event, payload);
  }

  on<E extends EventName>(event: E, handler: (payload: DomainEvents[E]) => void | Promise<void>): void {
    this.emitter.on(event, async (payload: DomainEvents[E]) => {
      try {
        await handler(payload);
      } catch (err) {
        logger.error(`[EventBus] Handler error for ${event}:`, err);
      }
    });
  }

  off<E extends EventName>(event: E, handler: (...args: unknown[]) => void): void {
    this.emitter.off(event, handler);
  }
}

export const eventBus = new DomainEventBus();
export type { DomainEvents, EventName };
