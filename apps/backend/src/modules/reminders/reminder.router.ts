import { Router, type Router as RouterType } from 'express';
import { reminderService } from './reminder.service.js';
import { validate } from '../../middleware/validate.js';
import { createReminderSchema, updateReminderSchema, reminderQuerySchema, snoozeReminderSchema } from './reminder.validator.js';

export const reminderRouter: RouterType = Router();

reminderRouter.get('/', validate(reminderQuerySchema, 'query'), async (req, res, next) => {
  try {
    const query = (req as Record<string, unknown>).validatedQuery as Parameters<typeof reminderService.list>[0];
    const result = await reminderService.list(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

reminderRouter.get('/active', async (_req, res, next) => {
  try {
    const reminders = await reminderService.getActive();
    res.json({ data: reminders });
  } catch (err) {
    next(err);
  }
});

reminderRouter.get('/:id', async (req, res, next) => {
  try {
    const reminder = await reminderService.getById(req.params.id as string);
    res.json({ data: reminder });
  } catch (err) {
    next(err);
  }
});

reminderRouter.post('/', validate(createReminderSchema), async (req, res, next) => {
  try {
    const reminder = await reminderService.create(req.body);
    res.status(201).json({ data: reminder });
  } catch (err) {
    next(err);
  }
});

reminderRouter.patch('/:id', validate(updateReminderSchema), async (req, res, next) => {
  try {
    const reminder = await reminderService.update(req.params.id as string, req.body);
    res.json({ data: reminder });
  } catch (err) {
    next(err);
  }
});

reminderRouter.post('/:id/snooze', validate(snoozeReminderSchema), async (req, res, next) => {
  try {
    const reminder = await reminderService.snooze(req.params.id as string, req.body.minutes);
    res.json({ data: reminder });
  } catch (err) {
    next(err);
  }
});

reminderRouter.post('/:id/dismiss', async (req, res, next) => {
  try {
    const reminder = await reminderService.dismiss(req.params.id as string);
    res.json({ data: reminder });
  } catch (err) {
    next(err);
  }
});

reminderRouter.post('/:id/done', async (req, res, next) => {
  try {
    const reminder = await reminderService.markDone(req.params.id as string);
    res.json({ data: reminder });
  } catch (err) {
    next(err);
  }
});

reminderRouter.delete('/:id', async (req, res, next) => {
  try {
    await reminderService.delete(req.params.id as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
