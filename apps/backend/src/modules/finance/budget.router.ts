import { Router, type Router as RouterType } from 'express';
import { budgetService } from './budget.service.js';
import { validate } from '../../middleware/validate.js';
import {
  createBudgetSchema,
  updateBudgetSchema,
  budgetQuerySchema,
} from './transaction.validator.js';

export const budgetRouter: RouterType = Router();

budgetRouter.get('/', validate(budgetQuerySchema, 'query'), async (req, res, next) => {
  try {
    const { month, year } = (req as unknown as Record<string, unknown>).validatedQuery as { month: number; year: number };
    const budgets = await budgetService.list(month, year);
    res.json({ data: budgets });
  } catch (err) {
    next(err);
  }
});

budgetRouter.post('/', validate(createBudgetSchema), async (req, res, next) => {
  try {
    const budget = await budgetService.create(req.body);
    res.status(201).json({ data: budget });
  } catch (err) {
    next(err);
  }
});

budgetRouter.patch('/:id', validate(updateBudgetSchema), async (req, res, next) => {
  try {
    const budget = await budgetService.update(req.params.id as string, req.body);
    res.json({ data: budget });
  } catch (err) {
    next(err);
  }
});

budgetRouter.delete('/:id', async (req, res, next) => {
  try {
    await budgetService.delete(req.params.id as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
