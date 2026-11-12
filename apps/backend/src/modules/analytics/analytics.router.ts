import { Router } from 'express';
import {
  getProductivityStats,
  getFinanceStats,
  getHabitStats,
  getGoalStats,
} from './analytics.service.js';

const router = Router();

router.get('/productivity', async (req, res, next) => {
  try {
    const period = (req.query.period as string) || 'month';
    const data = await getProductivityStats(period);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/finance', async (req, res, next) => {
  try {
    const period = (req.query.period as string) || 'month';
    const data = await getFinanceStats(period);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/habits', async (req, res, next) => {
  try {
    const period = (req.query.period as string) || 'month';
    const data = await getHabitStats(period);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/goals', async (req, res, next) => {
  try {
    const period = (req.query.period as string) || 'month';
    const data = await getGoalStats(period);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export { router as analyticsRouter };
