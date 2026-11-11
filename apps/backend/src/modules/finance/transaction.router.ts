import { Router, type Router as RouterType } from 'express';
import { transactionService } from './transaction.service.js';
import { validate } from '../../middleware/validate.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
  summaryQuerySchema,
  recentQuerySchema,
} from './transaction.validator.js';

export const transactionRouter: RouterType = Router();

transactionRouter.get('/', validate(transactionQuerySchema, 'query'), async (req, res, next) => {
  try {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as Parameters<typeof transactionService.list>[0];
    const result = await transactionService.list(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

transactionRouter.get('/summary', validate(summaryQuerySchema, 'query'), async (req, res, next) => {
  try {
    const { month, year } = (req as unknown as Record<string, unknown>).validatedQuery as { month: number; year: number };
    const summary = await transactionService.getSummary(month, year);
    res.json({ data: summary });
  } catch (err) {
    next(err);
  }
});

transactionRouter.get('/recent', validate(recentQuerySchema, 'query'), async (req, res, next) => {
  try {
    const { limit } = (req as unknown as Record<string, unknown>).validatedQuery as { limit: number };
    const transactions = await transactionService.getRecent(limit);
    res.json({ data: transactions });
  } catch (err) {
    next(err);
  }
});

transactionRouter.get('/:id', async (req, res, next) => {
  try {
    const transaction = await transactionService.getById(req.params.id as string);
    res.json({ data: transaction });
  } catch (err) {
    next(err);
  }
});

transactionRouter.post('/', validate(createTransactionSchema), async (req, res, next) => {
  try {
    const transaction = await transactionService.create(req.body);
    res.status(201).json({ data: transaction });
  } catch (err) {
    next(err);
  }
});

transactionRouter.patch('/:id', validate(updateTransactionSchema), async (req, res, next) => {
  try {
    const transaction = await transactionService.update(req.params.id as string, req.body);
    res.json({ data: transaction });
  } catch (err) {
    next(err);
  }
});

transactionRouter.delete('/:id', async (req, res, next) => {
  try {
    await transactionService.delete(req.params.id as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
