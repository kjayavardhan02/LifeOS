import { Router, type Router as RouterType } from 'express';
import type { Request } from 'express';
import { knowledgeService } from './knowledge.service.js';
import { validate } from '../../middleware/validate.js';
import {
  createQuickNoteSchema,
  updateQuickNoteSchema,
  knowledgeQuerySchema,
  createBookmarkSchema,
  updateBookmarkSchema,
  bookmarkQuerySchema,
} from './knowledge.validator.js';

type AuthRequest = Request & { userId: string };

export const knowledgeRouter: RouterType = Router();

// --- Notes ---

knowledgeRouter.get('/notes', validate(knowledgeQuerySchema, 'query'), async (req, res, next) => {
  try {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as Parameters<typeof knowledgeService.listNotes>[0];
    const result = await knowledgeService.listNotes(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

knowledgeRouter.get('/stats', async (_req, res, next) => {
  try {
    const stats = await knowledgeService.getVaultStats();
    res.json({ data: stats });
  } catch (err) {
    next(err);
  }
});

knowledgeRouter.get('/folders', async (_req, res, next) => {
  try {
    const folders = await knowledgeService.getFolders();
    res.json({ data: folders });
  } catch (err) {
    next(err);
  }
});

knowledgeRouter.get('/notes/:id', async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const note = await knowledgeService.getNote(req.params.id as string, userId);
    res.json({ data: note });
  } catch (err) {
    next(err);
  }
});

knowledgeRouter.post('/notes', validate(createQuickNoteSchema), async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const note = await knowledgeService.createQuickNote(req.body, userId);
    res.status(201).json({ data: note });
  } catch (err) {
    next(err);
  }
});

knowledgeRouter.patch('/notes/:id', validate(updateQuickNoteSchema), async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const note = await knowledgeService.updateQuickNote(req.params.id as string, req.body, userId);
    res.json({ data: note });
  } catch (err) {
    next(err);
  }
});

knowledgeRouter.delete('/notes/:id', async (req, res, next) => {
  try {
    await knowledgeService.deleteNote(req.params.id as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

knowledgeRouter.patch('/notes/:id/pin', async (req, res, next) => {
  try {
    const note = await knowledgeService.togglePin(req.params.id as string);
    res.json({ data: note });
  } catch (err) {
    next(err);
  }
});

knowledgeRouter.patch('/notes/:id/archive', async (req, res, next) => {
  try {
    const note = await knowledgeService.toggleArchive(req.params.id as string);
    res.json({ data: note });
  } catch (err) {
    next(err);
  }
});

knowledgeRouter.post('/scan', async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const result = await knowledgeService.scanVault(userId);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

// --- Bookmarks ---

knowledgeRouter.get('/bookmarks', validate(bookmarkQuerySchema, 'query'), async (req, res, next) => {
  try {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as Parameters<typeof knowledgeService.listBookmarks>[0];
    const result = await knowledgeService.listBookmarks(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

knowledgeRouter.post('/bookmarks', validate(createBookmarkSchema), async (req, res, next) => {
  try {
    const bookmark = await knowledgeService.createBookmark(req.body);
    res.status(201).json({ data: bookmark });
  } catch (err) {
    next(err);
  }
});

knowledgeRouter.patch('/bookmarks/:id', validate(updateBookmarkSchema), async (req, res, next) => {
  try {
    const bookmark = await knowledgeService.updateBookmark(req.params.id as string, req.body);
    res.json({ data: bookmark });
  } catch (err) {
    next(err);
  }
});

knowledgeRouter.delete('/bookmarks/:id', async (req, res, next) => {
  try {
    await knowledgeService.deleteBookmark(req.params.id as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

knowledgeRouter.patch('/bookmarks/:id/pin', async (req, res, next) => {
  try {
    const bookmark = await knowledgeService.toggleBookmarkPin(req.params.id as string);
    res.json({ data: bookmark });
  } catch (err) {
    next(err);
  }
});
