import { Router, type Router as RouterType } from 'express';
import { habitService } from './habit.service.js';
import { validate } from '../../middleware/validate.js';
import {
  createHabitSchema,
  updateHabitSchema,
  habitQuerySchema,
  logHabitSchema,
  habitLogsQuerySchema,
} from './habit.validator.js';

export const habitRouter: RouterType = Router();

habitRouter.get('/', validate(habitQuerySchema, 'query'), async (req, res, next) => {
  try {
    const query = (req as Record<string, unknown>).validatedQuery as Parameters<typeof habitService.list>[0];
    const result = await habitService.list(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

habitRouter.get('/stats', async (_req, res, next) => {
  try {
    const stats = await habitService.getStats();
    res.json({ data: stats });
  } catch (err) {
    next(err);
  }
});

habitRouter.get('/today', async (_req, res, next) => {
  try {
    const checklist = await habitService.getTodayChecklist();
    res.json({ data: checklist });
  } catch (err) {
    next(err);
  }
});

habitRouter.get('/:id', async (req, res, next) => {
  try {
    const habit = await habitService.getById(req.params.id as string);
    res.json({ data: habit });
  } catch (err) {
    next(err);
  }
});

habitRouter.post('/', validate(createHabitSchema), async (req, res, next) => {
  try {
    const habit = await habitService.create(req.body);
    res.status(201).json({ data: habit });
  } catch (err) {
    next(err);
  }
});

habitRouter.patch('/:id', validate(updateHabitSchema), async (req, res, next) => {
  try {
    const habit = await habitService.update(req.params.id as string, req.body);
    res.json({ data: habit });
  } catch (err) {
    next(err);
  }
});

habitRouter.delete('/:id', async (req, res, next) => {
  try {
    await habitService.delete(req.params.id as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Logging
habitRouter.post('/:id/log', validate(logHabitSchema), async (req, res, next) => {
  try {
    const log = await habitService.logCompletion(req.params.id as string, req.body);
    res.json({ data: log });
  } catch (err) {
    next(err);
  }
});

habitRouter.get('/:id/logs', validate(habitLogsQuerySchema, 'query'), async (req, res, next) => {
  try {
    const query = (req as Record<string, unknown>).validatedQuery as Parameters<typeof habitService.getLogs>[1];
    const logs = await habitService.getLogs(req.params.id as string, query);
    res.json({ data: logs });
  } catch (err) {
    next(err);
  }
});
