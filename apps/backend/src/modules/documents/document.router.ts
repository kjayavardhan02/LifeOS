import { Router, type Router as RouterType } from 'express';
import multer from 'multer';
import path from 'path';
import { documentService } from './document.service.js';
import { validate } from '../../middleware/validate.js';
import {
  createDocumentSchema,
  updateDocumentSchema,
  documentQuerySchema,
  expiringQuerySchema,
} from './document.validator.js';

export const documentRouter: RouterType = Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, '/tmp'),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
});

// GET /api/documents — list documents
documentRouter.get('/', validate(documentQuerySchema, 'query'), async (req, res, next) => {
  try {
    const query = (req as unknown as Record<string, unknown>).validatedQuery as Parameters<typeof documentService.list>[0];
    const result = await documentService.list(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/documents/stats — statistics
documentRouter.get('/stats', async (_req, res, next) => {
  try {
    const stats = await documentService.getStats();
    res.json({ data: stats });
  } catch (err) {
    next(err);
  }
});

// GET /api/documents/folders — list folders with document counts
documentRouter.get('/folders', async (_req, res, next) => {
  try {
    const folders = await documentService.getFolders();
    res.json({ data: folders });
  } catch (err) {
    next(err);
  }
});

// GET /api/documents/expiring — documents expiring soon
documentRouter.get('/expiring', validate(expiringQuerySchema, 'query'), async (req, res, next) => {
  try {
    const { days } = (req as unknown as Record<string, unknown>).validatedQuery as { days: number };
    const documents = await documentService.getExpiringDocuments(days);
    res.json({ data: documents });
  } catch (err) {
    next(err);
  }
});

// GET /api/documents/files/:fileId/download — download a file
documentRouter.get('/files/:fileId/download', async (req, res, next) => {
  try {
    const { file, fullPath } = await documentService.getFile(req.params.fileId as string);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
    res.sendFile(fullPath);
  } catch (err) {
    next(err);
  }
});

// GET /api/documents/:id — get document with files
documentRouter.get('/:id', async (req, res, next) => {
  try {
    const doc = await documentService.getById(req.params.id as string);
    res.json({ data: doc });
  } catch (err) {
    next(err);
  }
});

// POST /api/documents — create document (multipart form for file uploads)
documentRouter.post('/', upload.array('files', 10), async (req, res, next) => {
  try {
    const parsed = createDocumentSchema.safeParse(req.body);
    if (!parsed.success) {
      next(parsed.error);
      return;
    }
    const files = (req.files as Express.Multer.File[] | undefined)?.map((f) => ({
      originalname: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
      path: f.path,
      filename: f.filename,
    }));
    const doc = await documentService.create(parsed.data, files);
    res.status(201).json({ data: doc });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/documents/:id — update document metadata
documentRouter.patch('/:id', validate(updateDocumentSchema), async (req, res, next) => {
  try {
    const doc = await documentService.update(req.params.id as string, req.body);
    res.json({ data: doc });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/documents/:id — soft delete
documentRouter.delete('/:id', async (req, res, next) => {
  try {
    await documentService.delete(req.params.id as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// POST /api/documents/:id/files — upload additional files
documentRouter.post('/:id/files', upload.array('files', 10), async (req, res, next) => {
  try {
    const files = (req.files as Express.Multer.File[] | undefined)?.map((f) => ({
      originalname: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
      path: f.path,
      filename: f.filename,
    }));
    if (!files || files.length === 0) {
      res.status(400).json({ error: { message: 'No files provided', code: 'NO_FILES' } });
      return;
    }
    const doc = await documentService.uploadFiles(req.params.id as string, files);
    res.json({ data: doc });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/documents/:id/files/:fileId — delete a specific file
documentRouter.delete('/:id/files/:fileId', async (req, res, next) => {
  try {
    await documentService.deleteFile(req.params.id as string, req.params.fileId as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
