import { Router, type Router as RouterType } from 'express';
import { lifeContextService } from './life-context.service.js';

export const lifeContextRouter: RouterType = Router();

lifeContextRouter.get('/', async (_req, res, next) => {
  try {
    const data = await lifeContextService.getSnapshot();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});
