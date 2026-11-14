import cron from 'node-cron';
import { getQueue } from '../lib/queue.js';
import { logger } from '../lib/logger.js';

export function startScheduler(): void {
  // Every minute: check for due reminders
  cron.schedule('* * * * *', () => {
    getQueue('reminders').add('check-due-reminders', {});
  });

  // Every day at midnight: process recurring transactions
  cron.schedule('0 0 * * *', () => {
    getQueue('finance').add('process-recurring-transactions', {});
  });

  // Every day at 6am: check subscription renewals
  cron.schedule('0 6 * * *', () => {
    getQueue('subscriptions').add('check-renewal-reminders', {});
  });

  // Every day at 1am: check document expiry
  cron.schedule('0 1 * * *', () => {
    getQueue('documents').add('check-expiry-reminders', {});
  });

  // First day of month at midnight: reset habit freeze counters
  cron.schedule('0 0 1 * *', () => {
    getQueue('habits').add('reset-monthly-freezes', {});
  });

  logger.info('[Scheduler] Cron jobs registered');
}
