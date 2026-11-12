import { Router, type Router as RouterType } from 'express';
import { readingService } from './reading.service.js';
import { validate } from '../../middleware/validate.js';
import {
  createContentItemSchema,
  updateContentItemSchema,
  contentItemQuerySchema,
  createCollectionSchema,
  updateCollectionSchema,
  createHighlightSchema,
} from './reading.validator.js';

export const readingRouter: RouterType = Router();

// ── Content Items ──────────────────────────────────────────────────

readingRouter.get('/', validate(contentItemQuerySchema, 'query'), async (req, res, next) => {
  try {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as Parameters<typeof readingService.listItems>[0];
    const result = await readingService.listItems(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

readingRouter.get('/stats', async (_req, res, next) => {
  try {
    const stats = await readingService.getStats();
    res.json({ data: stats });
  } catch (err) {
    next(err);
  }
});

// ── Collections ────────────────────────────────────────────────────

readingRouter.get('/collections', async (_req, res, next) => {
  try {
    const collections = await readingService.listCollections();
    res.json({ data: collections });
  } catch (err) {
    next(err);
  }
});

readingRouter.post('/collections', validate(createCollectionSchema), async (req, res, next) => {
  try {
    const collection = await readingService.createCollection(req.body);
    res.status(201).json({ data: collection });
  } catch (err) {
    next(err);
  }
});

readingRouter.patch('/collections/:id', validate(updateCollectionSchema), async (req, res, next) => {
  try {
    const collection = await readingService.updateCollection(req.params.id as string, req.body);
    res.json({ data: collection });
  } catch (err) {
    next(err);
  }
});

readingRouter.delete('/collections/:id', async (req, res, next) => {
  try {
    await readingService.deleteCollection(req.params.id as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// ── Single Item ────────────────────────────────────────────────────

readingRouter.get('/:id', async (req, res, next) => {
  try {
    const item = await readingService.getItemById(req.params.id as string);
    res.json({ data: item });
  } catch (err) {
    next(err);
  }
});

readingRouter.post('/', validate(createContentItemSchema), async (req, res, next) => {
  try {
    const item = await readingService.createItem(req.body);
    res.status(201).json({ data: item });
  } catch (err) {
    next(err);
  }
});

readingRouter.patch('/:id', validate(updateContentItemSchema), async (req, res, next) => {
  try {
    const item = await readingService.updateItem(req.params.id as string, req.body);
    res.json({ data: item });
  } catch (err) {
    next(err);
  }
});

readingRouter.delete('/:id', async (req, res, next) => {
  try {
    await readingService.deleteItem(req.params.id as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// ── Highlights ─────────────────────────────────────────────────────

readingRouter.post('/:id/highlights', validate(createHighlightSchema), async (req, res, next) => {
  try {
    const highlight = await readingService.addHighlight(req.params.id as string, req.body);
    res.status(201).json({ data: highlight });
  } catch (err) {
    next(err);
  }
});

readingRouter.delete('/:id/highlights/:highlightId', async (req, res, next) => {
  try {
    await readingService.deleteHighlight(req.params.id as string, req.params.highlightId as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
