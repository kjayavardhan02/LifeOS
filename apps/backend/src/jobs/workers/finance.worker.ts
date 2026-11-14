import { createWorker } from '../../lib/queue.js';
import { prisma } from '../../lib/prisma.js';
import { eventBus } from '../../lib/event-bus.js';
import { logger } from '../../lib/logger.js';

function computeNextDate(from: Date, pattern: string): Date {
  const d = new Date(from);
  switch (pattern) {
    case 'daily': d.setDate(d.getDate() + 1); break;
    case 'weekly': d.setDate(d.getDate() + 7); break;
    case 'monthly': d.setMonth(d.getMonth() + 1); break;
    case 'yearly': d.setFullYear(d.getFullYear() + 1); break;
  }
  return d;
}

export function startFinanceWorker(): void {
  createWorker('finance', async (job) => {
    switch (job.name) {
      case 'process-recurring-transactions': {
        const now = new Date();
        const dueRecurring = await prisma.recurringTransaction.findMany({
          where: {
            deletedAt: null,
            isActive: true,
            nextRunDate: { lte: now },
          },
        });

        logger.info(`[FinanceWorker] Processing ${dueRecurring.length} recurring transactions`);

        for (const recurring of dueRecurring) {
          const transaction = await prisma.financeTransaction.create({
            data: {
              amount: recurring.amount,
              type: recurring.type,
              date: now,
              category: recurring.category,
              subcategory: recurring.subcategory,
              paymentMethod: recurring.paymentMethod,
              merchant: recurring.merchant,
              notes: `Auto-created from recurring: ${recurring.title}`,
              tags: recurring.tags,
              isRecurring: true,
              recurringId: recurring.id,
            },
          });

          const nextRunDate = computeNextDate(now, recurring.recurrencePattern);
          const shouldDeactivate = recurring.endDate && nextRunDate > recurring.endDate;

          await prisma.recurringTransaction.update({
            where: { id: recurring.id },
            data: {
              lastRunAt: now,
              nextRunDate: shouldDeactivate ? recurring.nextRunDate : nextRunDate,
              isActive: !shouldDeactivate,
            },
          });

          eventBus.emit('transaction.created', {
            transactionId: transaction.id,
            amount: transaction.amount,
            type: transaction.type,
            category: transaction.category,
          });
        }
        break;
      }
    }
  });
  logger.info('[FinanceWorker] Started');
}
