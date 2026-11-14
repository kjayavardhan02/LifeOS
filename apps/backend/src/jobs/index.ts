import { startReminderWorker } from './workers/reminder.worker.js';
import { startFinanceWorker } from './workers/finance.worker.js';
import { startSubscriptionWorker } from './workers/subscription.worker.js';
import { startDocumentWorker } from './workers/document.worker.js';
import { startHabitWorker } from './workers/habit.worker.js';
import { startScheduler } from './scheduler.js';
import { logger } from '../lib/logger.js';

export function startBackgroundJobs(): void {
  startReminderWorker();
  startFinanceWorker();
  startSubscriptionWorker();
  startDocumentWorker();
  startHabitWorker();
  startScheduler();
  logger.info('[Jobs] All background workers and scheduler started');
}
