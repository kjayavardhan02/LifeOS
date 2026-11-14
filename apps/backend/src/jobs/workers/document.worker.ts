import { createWorker } from '../../lib/queue.js';
import { prisma } from '../../lib/prisma.js';
import { logger } from '../../lib/logger.js';

export function startDocumentWorker(): void {
  createWorker('documents', async (job) => {
    switch (job.name) {
      case 'check-expiry-reminders': {
        const now = new Date();
        const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const expiringDocs = await prisma.document.findMany({
          where: {
            deletedAt: null,
            expiryDate: { gt: now, lte: thirtyDays },
          },
        });

        logger.info(`[DocumentWorker] Found ${expiringDocs.length} documents expiring within 30 days`);

        for (const doc of expiringDocs) {
          const existing = await prisma.reminder.findFirst({
            where: {
              deletedAt: null,
              linkedModule: 'documents',
              linkedItemId: doc.id,
              status: { in: ['pending', 'snoozed'] },
            },
          });

          if (!existing) {
            const reminderDate = new Date(doc.expiryDate!);
            reminderDate.setDate(reminderDate.getDate() - 7);
            const dueDate = reminderDate > now ? reminderDate : now;

            await prisma.reminder.create({
              data: {
                title: `Document expiring: ${doc.name}`,
                description: `${doc.category} document expires on ${doc.expiryDate!.toLocaleDateString()}`,
                dueDate,
                category: 'Document Expiry',
                priority: 'high',
                linkedModule: 'documents',
                linkedItemId: doc.id,
                notifyEmail: true,
                notifyBrowser: true,
              },
            });
          }
        }
        break;
      }
    }
  });
  logger.info('[DocumentWorker] Started');
}
