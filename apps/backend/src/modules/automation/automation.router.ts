import { Router, type Router as RouterType } from 'express';
import { automationService } from './automation.service.js';
import { registerRule, unregisterRule } from './automation.engine.js';
import { validate } from '../../middleware/validate.js';
import { createAutomationRuleSchema, updateAutomationRuleSchema, automationLogQuerySchema } from './automation.validator.js';

export const automationRouter: RouterType = Router();

automationRouter.get('/rules', async (_req, res, next) => {
  try {
    const result = await automationService.listRules();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

automationRouter.get('/rules/:id', async (req, res, next) => {
  try {
    const rule = await automationService.getRuleById(req.params.id as string);
    res.json({ data: rule });
  } catch (err) {
    next(err);
  }
});

automationRouter.post('/rules', validate(createAutomationRuleSchema), async (req, res, next) => {
  try {
    const rule = await automationService.createRule(req.body);
    if (rule.isActive) registerRule(rule);
    res.status(201).json({ data: rule });
  } catch (err) {
    next(err);
  }
});

automationRouter.patch('/rules/:id', validate(updateAutomationRuleSchema), async (req, res, next) => {
  try {
    const rule = await automationService.updateRule(req.params.id as string, req.body);
    unregisterRule(rule.id);
    if (rule.isActive) registerRule(rule);
    res.json({ data: rule });
  } catch (err) {
    next(err);
  }
});

automationRouter.delete('/rules/:id', async (req, res, next) => {
  try {
    unregisterRule(req.params.id as string);
    await automationService.deleteRule(req.params.id as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

automationRouter.get('/logs', validate(automationLogQuerySchema, 'query'), async (req, res, next) => {
  try {
    const query = (req as Record<string, unknown>).validatedQuery as Parameters<typeof automationService.listLogs>[0];
    const result = await automationService.listLogs(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
