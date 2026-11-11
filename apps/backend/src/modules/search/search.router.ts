import { Router, type Router as RouterType } from 'express';
import { searchService } from './search.service.js';
import { validate } from '../../middleware/validate.js';
import { searchQuerySchema } from './search.validator.js';

export const searchRouter: RouterType = Router();

searchRouter.get('/', validate(searchQuerySchema, 'query'), async (req, res, next) => {
  try {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as Parameters<typeof searchService.search>[0];
    const results = await searchService.search(query);
    res.json({ data: results });
  } catch (err) {
    next(err);
  }
});
