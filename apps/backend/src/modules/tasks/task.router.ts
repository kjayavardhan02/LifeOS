import { Router, type Router as RouterType } from 'express';
import { taskService } from './task.service.js';
import { validate } from '../../middleware/validate.js';
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
  createSubtaskSchema,
  updateSubtaskSchema,
} from './task.validator.js';

export const taskRouter: RouterType = Router();

taskRouter.get('/', validate(taskQuerySchema, 'query'), async (req, res, next) => {
  try {
    const query = (req as Record<string, unknown>).validatedQuery as Parameters<typeof taskService.list>[0];
    const result = await taskService.list(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

taskRouter.get('/:id', async (req, res, next) => {
  try {
    const task = await taskService.getById(req.params.id as string);
    res.json({ data: task });
  } catch (err) {
    next(err);
  }
});

taskRouter.post('/', validate(createTaskSchema), async (req, res, next) => {
  try {
    const task = await taskService.create(req.body);
    res.status(201).json({ data: task });
  } catch (err) {
    next(err);
  }
});

taskRouter.patch('/:id', validate(updateTaskSchema), async (req, res, next) => {
  try {
    const task = await taskService.update(req.params.id as string, req.body);
    res.json({ data: task });
  } catch (err) {
    next(err);
  }
});

taskRouter.delete('/:id', async (req, res, next) => {
  try {
    await taskService.delete(req.params.id as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Activity routes
taskRouter.get('/:id/activities', async (req, res, next) => {
  try {
    const activities = await taskService.getActivities(req.params.id as string);
    res.json({ data: activities });
  } catch (err) {
    next(err);
  }
});

// Subtask routes
taskRouter.post('/:id/subtasks', validate(createSubtaskSchema), async (req, res, next) => {
  try {
    const subtask = await taskService.addSubtask(req.params.id as string, req.body);
    res.status(201).json({ data: subtask });
  } catch (err) {
    next(err);
  }
});

taskRouter.patch('/:id/subtasks/:subtaskId', validate(updateSubtaskSchema), async (req, res, next) => {
  try {
    const subtask = await taskService.updateSubtask(
      req.params.id as string,
      req.params.subtaskId as string,
      req.body,
    );
    res.json({ data: subtask });
  } catch (err) {
    next(err);
  }
});

taskRouter.delete('/:id/subtasks/:subtaskId', async (req, res, next) => {
  try {
    await taskService.deleteSubtask(req.params.id as string, req.params.subtaskId as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
