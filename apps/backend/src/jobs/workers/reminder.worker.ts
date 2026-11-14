import { createWorker } from '../../lib/queue.js';
import { prisma } from '../../lib/prisma.js';
import { sendEmail } from '../../lib/mailer.js';
import { eventBus } from '../../lib/event-bus.js';
import { logger } from '../../lib/logger.js';

export function startReminderWorker(): void {
  createWorker('reminders', async (job) => {
    switch (job.name) {
      case 'check-due-reminders': {
        const now = new Date();
        const dueReminders = await prisma.reminder.findMany({
          where: {
            deletedAt: null,
            status: 'pending',
            dueDate: { lte: now },
          },
        });

        logger.info(`[ReminderWorker] Found ${dueReminders.length} due reminders`);

        for (const reminder of dueReminders) {
          eventBus.emit('reminder.due', {
            reminderId: reminder.id,
            title: reminder.title,
            notifyEmail: reminder.notifyEmail,
            notifyBrowser: reminder.notifyBrowser,
          });

          if (reminder.notifyEmail) {
            const user = await prisma.user.findFirst();
            if (user) {
              await sendEmail(
                user.email,
                `LifeOS Reminder: ${reminder.title}`,
                `<h3>${reminder.title}</h3><p>${reminder.description || ''}</p><p>Due: ${reminder.dueDate.toLocaleString()}</p>`,
              );
            }
          }
        }
        break;
      }
      case 'send-reminder-email': {
        const { to, subject, html } = job.data as { to: string; subject: string; html: string };
        await sendEmail(to, subject, html);
        break;
      }
    }
  });
  logger.info('[ReminderWorker] Started');
}
