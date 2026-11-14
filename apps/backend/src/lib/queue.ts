import { Queue, Worker, type Job } from 'bullmq';
import { redis } from './redis.js';
import { logger } from './logger.js';

const queues = new Map<string, Queue>();

export function getQueue(name: string): Queue {
  if (!queues.has(name)) {
    queues.set(name, new Queue(name, { connection: redis }));
  }
  return queues.get(name)!;
}

export function createWorker<T>(
  queueName: string,
  processor: (job: Job<T>) => Promise<void>,
): Worker {
  const worker = new Worker<T>(queueName, processor, { connection: redis });
  worker.on('failed', (job, err) => {
    logger.error(`[Queue:${queueName}] Job ${job?.id} failed:`, err);
  });
  worker.on('completed', (job) => {
    logger.info(`[Queue:${queueName}] Job ${job.id} completed`);
  });
  return worker;
}
