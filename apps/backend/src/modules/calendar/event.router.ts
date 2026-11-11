import { Router, type Router as RouterType } from 'express';
import { eventService } from './event.service.js';
import { validate } from '../../middleware/validate.js';
import { createEventSchema, updateEventSchema, eventQuerySchema } from './event.validator.js';

export const eventRouter: RouterType = Router();

eventRouter.get('/', validate(eventQuerySchema, 'query'), async (req, res, next) => {
  try {
    const query = (req as Record<string, unknown>).validatedQuery as Parameters<typeof eventService.list>[0];
    const result = await eventService.list(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

eventRouter.get('/upcoming', async (req, res, next) => {
  try {
    const days = req.query.days ? Number(req.query.days) : 7;
    const events = await eventService.getUpcoming(days);
    res.json({ data: events });
  } catch (err) {
    next(err);
  }
});

eventRouter.get('/:id', async (req, res, next) => {
  try {
    const event = await eventService.getById(req.params.id as string);
    res.json({ data: event });
  } catch (err) {
    next(err);
  }
});

eventRouter.post('/', validate(createEventSchema), async (req, res, next) => {
  try {
    const event = await eventService.create(req.body);
    res.status(201).json({ data: event });
  } catch (err) {
    next(err);
  }
});

eventRouter.patch('/:id', validate(updateEventSchema), async (req, res, next) => {
  try {
    const event = await eventService.update(req.params.id as string, req.body);
    res.json({ data: event });
  } catch (err) {
    next(err);
  }
});

eventRouter.delete('/:id', async (req, res, next) => {
  try {
    await eventService.delete(req.params.id as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
