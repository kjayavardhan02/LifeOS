import { Router, type Router as RouterType } from 'express';
import { subscriptionService } from './subscription.service.js';
import { validate } from '../../middleware/validate.js';
import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
  subscriptionQuerySchema,
  upcomingQuerySchema,
} from './subscription.validator.js';

export const subscriptionRouter: RouterType = Router();

subscriptionRouter.get('/', validate(subscriptionQuerySchema, 'query'), async (req, res, next) => {
  try {
    const query = (req as Record<string, unknown>).validatedQuery as Parameters<typeof subscriptionService.list>[0];
    const result = await subscriptionService.list(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

subscriptionRouter.get('/summary', async (_req, res, next) => {
  try {
    const summary = await subscriptionService.getSummary();
    res.json({ data: summary });
  } catch (err) {
    next(err);
  }
});

subscriptionRouter.get('/upcoming', validate(upcomingQuerySchema, 'query'), async (req, res, next) => {
  try {
    const query = (req as Record<string, unknown>).validatedQuery as { days: number };
    const data = await subscriptionService.getUpcomingRenewals(query.days);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

subscriptionRouter.get('/:id', async (req, res, next) => {
  try {
    const subscription = await subscriptionService.getById(req.params.id as string);
    res.json({ data: subscription });
  } catch (err) {
    next(err);
  }
});

subscriptionRouter.post('/', validate(createSubscriptionSchema), async (req, res, next) => {
  try {
    const subscription = await subscriptionService.create(req.body);
    res.status(201).json({ data: subscription });
  } catch (err) {
    next(err);
  }
});

subscriptionRouter.patch('/:id', validate(updateSubscriptionSchema), async (req, res, next) => {
  try {
    const subscription = await subscriptionService.update(req.params.id as string, req.body);
    res.json({ data: subscription });
  } catch (err) {
    next(err);
  }
});

subscriptionRouter.delete('/:id', async (req, res, next) => {
  try {
    await subscriptionService.delete(req.params.id as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
