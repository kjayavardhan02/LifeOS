import { Router, type Router as RouterType } from 'express';
import { projectService } from './project.service.js';
import { validate } from '../../middleware/validate.js';
import {
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
  createMilestoneSchema,
  updateMilestoneSchema,
} from './project.validator.js';

export const projectRouter: RouterType = Router();

// Project CRUD
projectRouter.get('/', validate(projectQuerySchema, 'query'), async (req, res, next) => {
  try {
    const query = (req as Record<string, unknown>).validatedQuery as Parameters<typeof projectService.list>[0];
    const result = await projectService.list(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

projectRouter.get('/:id', async (req, res, next) => {
  try {
    const project = await projectService.getById(req.params.id as string);
    res.json({ data: project });
  } catch (err) {
    next(err);
  }
});

projectRouter.post('/', validate(createProjectSchema), async (req, res, next) => {
  try {
    const project = await projectService.create(req.body);
    res.status(201).json({ data: project });
  } catch (err) {
    next(err);
  }
});

projectRouter.patch('/:id', validate(updateProjectSchema), async (req, res, next) => {
  try {
    const project = await projectService.update(req.params.id as string, req.body);
    res.json({ data: project });
  } catch (err) {
    next(err);
  }
});

projectRouter.delete('/:id', async (req, res, next) => {
  try {
    await projectService.delete(req.params.id as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Milestones
projectRouter.post('/:id/milestones', validate(createMilestoneSchema), async (req, res, next) => {
  try {
    const milestone = await projectService.addMilestone(req.params.id as string, req.body);
    res.status(201).json({ data: milestone });
  } catch (err) {
    next(err);
  }
});

projectRouter.patch('/:id/milestones/:milestoneId', validate(updateMilestoneSchema), async (req, res, next) => {
  try {
    const milestone = await projectService.updateMilestone(
      req.params.id as string,
      req.params.milestoneId as string,
      req.body,
    );
    res.json({ data: milestone });
  } catch (err) {
    next(err);
  }
});

projectRouter.delete('/:id/milestones/:milestoneId', async (req, res, next) => {
  try {
    await projectService.deleteMilestone(
      req.params.id as string,
      req.params.milestoneId as string,
    );
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Task linking
projectRouter.post('/:id/tasks/:taskId/link', async (req, res, next) => {
  try {
    const task = await projectService.linkTask(
      req.params.id as string,
      req.params.taskId as string,
    );
    res.json({ data: task });
  } catch (err) {
    next(err);
  }
});

projectRouter.delete('/:id/tasks/:taskId/link', async (req, res, next) => {
  try {
    await projectService.unlinkTask(
      req.params.id as string,
      req.params.taskId as string,
    );
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Stats
projectRouter.get('/:id/stats', async (req, res, next) => {
  try {
    const stats = await projectService.getStats(req.params.id as string);
    res.json({ data: stats });
  } catch (err) {
    next(err);
  }
});
