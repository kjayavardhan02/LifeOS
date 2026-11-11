import { Router, type Router as RouterType } from 'express';
import { quickCaptureService } from './quick-capture.service.js';
import { validate } from '../../middleware/validate.js';
import { captureInputSchema, recentQuerySchema } from './quick-capture.validator.js';

type QuickCaptureType = 'task' | 'expense' | 'note' | 'reminder' | 'event';

export const quickCaptureRouter: RouterType = Router();

// Parse only (preview, no create)
quickCaptureRouter.post('/parse', validate(captureInputSchema), async (req, res, next) => {
  try {
    const { input, type } = req.body as { input: string; type?: QuickCaptureType };
    const result = quickCaptureService.parseInput(input, type);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

// Parse + create
quickCaptureRouter.post('/', validate(captureInputSchema), async (req, res, next) => {
  try {
    const { input, type } = req.body as { input: string; type?: QuickCaptureType };
    const result = await quickCaptureService.capture(input, type);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
});

// Recent captures
quickCaptureRouter.get('/recent', validate(recentQuerySchema, 'query'), async (req, res, next) => {
  try {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as { limit: number };
    const result = await quickCaptureService.getRecent(query.limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Delete a capture log entry
quickCaptureRouter.delete('/:id', async (req, res, next) => {
  try {
    await quickCaptureService.deleteCapture(req.params.id as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
