import { createWorker } from '../../lib/queue.js';
import { prisma } from '../../lib/prisma.js';
import { eventBus } from '../../lib/event-bus.js';
import { logger } from '../../lib/logger.js';

function advanceRenewalDate(from: Date, billingCycle: string): Date {
  const d = new Date(from);
  switch (billingCycle) {
    case 'monthly': d.setMonth(d.getMonth() + 1); break;
    case 'quarterly': d.setMonth(d.getMonth() + 3); break;
    case 'yearly': d.setFullYear(d.getFullYear() + 1); break;
  }
  return d;
}

export function startSubscriptionWorker(): void {
  createWorker('subscriptions', async (job) => {
    switch (job.name) {
      case 'check-renewal-reminders': {
        const now = new Date();
        const activeSubscriptions = await prisma.subscription.findMany({
          where: { deletedAt: null, status: 'active' },
        });

        logger.info(`[SubscriptionWorker] Checking ${activeSubscriptions.length} active subscriptions`);

        for (const sub of activeSubscriptions) {
          // Auto-create finance transaction if renewal date has passed
          if (sub.nextRenewalDate <= now) {
            const transaction = await prisma.financeTransaction.create({
              data: {
                amount: sub.amount,
                type: 'expense',
                date: sub.nextRenewalDate,
                category: sub.category,
                paymentMethod: sub.paymentMethod,
                merchant: sub.name,
                notes: `Auto-created: ${sub.name} renewal`,
                subscriptionId: sub.id,
                isRecurring: true,
              },
            });

            const nextRenewalDate = advanceRenewalDate(sub.nextRenewalDate, sub.billingCycle);
            await prisma.subscription.update({
              where: { id: sub.id },
              data: { nextRenewalDate },
            });

            eventBus.emit('subscription.renewed', {
              subscriptionId: sub.id,
              name: sub.name,
              amount: sub.amount,
              nextRenewalDate: nextRenewalDate.toISOString(),
              billingCycle: sub.billingCycle,
              category: sub.category,
              paymentMethod: sub.paymentMethod,
            });

            eventBus.emit('transaction.created', {
              transactionId: transaction.id,
              title: sub.name,
              amount: transaction.amount,
              type: transaction.type,
              category: transaction.category,
              subscriptionId: sub.id,
            });
          }

          // Auto-create reminders for upcoming renewals
          for (const daysBefore of sub.reminderDaysBefore) {
            const renewalDate = sub.nextRenewalDate;
            const reminderDate = new Date(renewalDate);
            reminderDate.setDate(reminderDate.getDate() - daysBefore);

            if (reminderDate > now && reminderDate <= new Date(now.getTime() + 24 * 60 * 60 * 1000)) {
              const existing = await prisma.reminder.findFirst({
                where: {
                  deletedAt: null,
                  linkedModule: 'subscriptions',
                  linkedItemId: sub.id,
                  dueDate: { gte: new Date(reminderDate.toISOString().slice(0, 10) + 'T00:00:00Z'), lte: new Date(reminderDate.toISOString().slice(0, 10) + 'T23:59:59Z') },
                },
              });

              if (!existing) {
                await prisma.reminder.create({
                  data: {
                    title: `${sub.name} renewal in ${daysBefore} day${daysBefore > 1 ? 's' : ''}`,
                    description: `Amount: ₹${sub.amount} (${sub.billingCycle})`,
                    dueDate: reminderDate,
                    category: 'Subscription Renewal',
                    priority: 'medium',
                    linkedModule: 'subscriptions',
                    linkedItemId: sub.id,
                    notifyEmail: true,
                    notifyBrowser: true,
                  },
                });
              }
            }
          }
        }
        break;
      }
    }
  });
  logger.info('[SubscriptionWorker] Started');
}
