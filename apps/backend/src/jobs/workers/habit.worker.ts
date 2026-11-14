import { createWorker } from '../../lib/queue.js';
import { prisma } from '../../lib/prisma.js';
import { logger } from '../../lib/logger.js';

export function startHabitWorker(): void {
  createWorker('habits', async (job) => {
    switch (job.name) {
      case 'reset-monthly-freezes': {
        const result = await prisma.habit.updateMany({
          where: { deletedAt: null, isArchived: false },
          data: { freezesUsed: 0 },
        });
        logger.info(`[HabitWorker] Reset freezes for ${result.count} habits`);
        break;
      }
    }
  });
  logger.info('[HabitWorker] Started');
}
