import { Router, type Router as RouterType } from 'express';
import { goalService } from './goal.service.js';
import { validate } from '../../middleware/validate.js';
import {
  createGoalSchema,
  updateGoalSchema,
  goalQuerySchema,
  createGoalMilestoneSchema,
  updateGoalMilestoneSchema,
} from './goal.validator.js';

export const goalRouter: RouterType = Router();

goalRouter.get('/', validate(goalQuerySchema, 'query'), async (req, res, next) => {
  try {
    const query = (req as Record<string, unknown>).validatedQuery as Parameters<typeof goalService.list>[0];
    const result = await goalService.list(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

goalRouter.get('/stats', async (_req, res, next) => {
  try {
    const stats = await goalService.getStats();
    res.json({ data: stats });
  } catch (err) {
    next(err);
  }
});

goalRouter.get('/:id', async (req, res, next) => {
  try {
    const goal = await goalService.getById(req.params.id as string);
    res.json({ data: goal });
  } catch (err) {
    next(err);
  }
});

goalRouter.post('/', validate(createGoalSchema), async (req, res, next) => {
  try {
    const goal = await goalService.create(req.body);
    res.status(201).json({ data: goal });
  } catch (err) {
    next(err);
  }
});

goalRouter.patch('/:id', validate(updateGoalSchema), async (req, res, next) => {
  try {
    const goal = await goalService.update(req.params.id as string, req.body);
    res.json({ data: goal });
  } catch (err) {
    next(err);
  }
});

goalRouter.delete('/:id', async (req, res, next) => {
  try {
    await goalService.delete(req.params.id as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Milestones
goalRouter.post('/:id/milestones', validate(createGoalMilestoneSchema), async (req, res, next) => {
  try {
    const milestone = await goalService.addMilestone(req.params.id as string, req.body);
    res.status(201).json({ data: milestone });
  } catch (err) {
    next(err);
  }
});

goalRouter.patch('/:id/milestones/:milestoneId', validate(updateGoalMilestoneSchema), async (req, res, next) => {
  try {
    const milestone = await goalService.updateMilestone(
      req.params.id as string,
      req.params.milestoneId as string,
      req.body,
    );
    res.json({ data: milestone });
  } catch (err) {
    next(err);
  }
});

goalRouter.delete('/:id/milestones/:milestoneId', async (req, res, next) => {
  try {
    await goalService.deleteMilestone(
      req.params.id as string,
      req.params.milestoneId as string,
    );
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Task linking
goalRouter.post('/:id/tasks/:taskId/link', async (req, res, next) => {
  try {
    const task = await goalService.linkTask(
      req.params.id as string,
      req.params.taskId as string,
    );
    res.json({ data: task });
  } catch (err) {
    next(err);
  }
});

goalRouter.delete('/:id/tasks/:taskId/link', async (req, res, next) => {
  try {
    await goalService.unlinkTask(
      req.params.id as string,
      req.params.taskId as string,
    );
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Habit linking
goalRouter.post('/:id/habits/:habitId/link', async (req, res, next) => {
  try {
    const habit = await goalService.linkHabit(
      req.params.id as string,
      req.params.habitId as string,
    );
    res.json({ data: habit });
  } catch (err) {
    next(err);
  }
});

goalRouter.delete('/:id/habits/:habitId/link', async (req, res, next) => {
  try {
    await goalService.unlinkHabit(
      req.params.id as string,
      req.params.habitId as string,
    );
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
