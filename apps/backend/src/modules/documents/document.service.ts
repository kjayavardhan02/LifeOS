import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error-handler.js';
import type { z } from 'zod';
import type {
  createDocumentSchema,
  updateDocumentSchema,
  documentQuerySchema,
} from './document.validator.js';

type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
type DocumentQuery = z.infer<typeof documentQuerySchema>;

interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
  filename: string;
}

const VAULT_BASE = path.resolve(process.cwd(), '../../vault/documents');

function sanitizeFolder(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim() || 'other';
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function moveFile(src: string, dest: string): Promise<void> {
  await ensureDir(path.dirname(dest));
  await fs.copyFile(src, dest);
  await fs.unlink(src);
}

const documentInclude = {
  files: { orderBy: { version: 'desc' as const } },
};

export const documentService = {
  async list(query: DocumentQuery) {
    const { page, limit, sortBy, sortOrder, ...filters } = query;
    const where = buildWhereClause(filters);
    const skip = (page - 1) * limit;

    const orderBy: Record<string, string> = { [sortBy]: sortOrder };

    const [data, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: documentInclude,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.document.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const doc = await prisma.document.findFirst({
      where: { id, deletedAt: null },
      include: documentInclude,
    });
    if (!doc) throw new AppError(404, 'Document not found', 'NOT_FOUND');
    return doc;
  },

  async create(input: CreateDocumentInput, files?: UploadedFile[]) {
    const category = input.category ?? 'Other';
    const storageType = input.storageType ?? 'local';

    const doc = await prisma.document.create({
      data: {
        name: input.name,
        description: input.description,
        category,
        folder: input.folder || '/',
        tags: input.tags ?? [],
        documentNumber: input.documentNumber,
        issuer: input.issuer,
        issueDate: input.issueDate ? new Date(input.issueDate) : undefined,
        expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
        notes: input.notes,
        storageType,
        externalUrl: storageType === 'external' ? input.externalUrl : undefined,
      },
      include: documentInclude,
    });

    if (storageType === 'local' && files && files.length > 0) {
      await this.processFiles(doc.id, category, files);
      return prisma.document.findUnique({
        where: { id: doc.id },
        include: documentInclude,
      });
    }

    return doc;
  },

  async update(id: string, input: UpdateDocumentInput) {
    await this.getById(id);

    const data: Prisma.DocumentUpdateInput = {};

    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.category !== undefined) data.category = input.category;
    if (input.folder !== undefined) data.folder = input.folder;
    if (input.tags !== undefined) data.tags = input.tags;
    if (input.documentNumber !== undefined) data.documentNumber = input.documentNumber;
    if (input.issuer !== undefined) data.issuer = input.issuer;
    if (input.issueDate !== undefined) {
      data.issueDate = input.issueDate ? new Date(input.issueDate) : null;
    }
    if (input.expiryDate !== undefined) {
      data.expiryDate = input.expiryDate ? new Date(input.expiryDate) : null;
    }
    if (input.notes !== undefined) data.notes = input.notes;
    if (input.externalUrl !== undefined) data.externalUrl = input.externalUrl;

    return prisma.document.update({
      where: { id },
      data,
      include: documentInclude,
    });
  },

  async delete(id: string) {
    await this.getById(id);
    await prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async uploadFiles(documentId: string, files: UploadedFile[]) {
    const doc = await this.getById(documentId);
    if (doc.storageType !== 'local') {
      throw new AppError(400, 'Cannot upload files to an external-link document', 'INVALID_OPERATION');
    }
    await this.processFiles(documentId, doc.category, files);
    return prisma.document.findUnique({
      where: { id: documentId },
      include: documentInclude,
    });
  },

  async deleteFile(documentId: string, fileId: string) {
    await this.getById(documentId);

    const file = await prisma.documentFile.findFirst({
      where: { id: fileId, documentId },
    });
    if (!file) throw new AppError(404, 'File not found', 'NOT_FOUND');

    const fullPath = path.join(VAULT_BASE, file.filePath);
    try {
      await fs.unlink(fullPath);
    } catch {
      // File might already be missing from disk — that's ok
    }

    await prisma.documentFile.delete({ where: { id: fileId } });
  },

  async getFile(fileId: string) {
    const file = await prisma.documentFile.findUnique({
      where: { id: fileId },
      include: { document: true },
    });
    if (!file || file.document.deletedAt) {
      throw new AppError(404, 'File not found', 'NOT_FOUND');
    }
    const fullPath = path.join(VAULT_BASE, file.filePath);
    try {
      await fs.access(fullPath);
    } catch {
      throw new AppError(404, 'File not found on disk', 'FILE_NOT_FOUND');
    }
    return { file, fullPath };
  },

  async getStats() {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [total, byCategory, expiringSoon, expired, storageResult] = await Promise.all([
      prisma.document.count({ where: { deletedAt: null } }),
      prisma.document.groupBy({
        by: ['category'],
        where: { deletedAt: null },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.document.count({
        where: {
          deletedAt: null,
          expiryDate: { gt: now, lte: thirtyDaysFromNow },
        },
      }),
      prisma.document.count({
        where: {
          deletedAt: null,
          expiryDate: { lte: now },
        },
      }),
      prisma.documentFile.aggregate({
        _sum: { fileSize: true },
      }),
    ]);

    return {
      total,
      byCategory: byCategory.map((b) => ({
        category: b.category,
        count: b._count.id,
      })),
      expiringSoon,
      expired,
      storageUsed: storageResult._sum.fileSize ?? 0,
    };
  },

  async getFolders() {
    const result = await prisma.document.groupBy({
      by: ['folder'],
      where: { deletedAt: null },
      _count: { id: true },
      orderBy: { folder: 'asc' },
    });
    return result.map((r) => ({ folder: r.folder, count: r._count.id }));
  },

  async createFolder(folderPath: string) {
    // Folders are virtual — they exist as values in the document.folder column.
    // Creating an empty folder means inserting a placeholder that we track.
    // But since folders are derived from documents, we just validate the path.
    // The frontend will track empty folders in its own state until a document is added.
    return { folder: folderPath };
  },

  async getExpiringDocuments(days: number) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return prisma.document.findMany({
      where: {
        deletedAt: null,
        expiryDate: { lte: futureDate },
      },
      include: documentInclude,
      orderBy: { expiryDate: 'asc' },
    });
  },

  async processFiles(documentId: string, category: string, files: UploadedFile[]) {
    const folder = sanitizeFolder(category);

    const existingMax = await prisma.documentFile.aggregate({
      where: { documentId },
      _max: { version: true },
    });
    let version = (existingMax._max.version ?? 0) + 1;

    const records = [];
    for (const file of files) {
      const uniqueName = `${crypto.randomUUID()}-${file.originalname}`;
      const relativePath = path.join(folder, uniqueName);
      const destPath = path.join(VAULT_BASE, relativePath);

      await moveFile(file.path, destPath);

      records.push({
        documentId,
        fileName: uniqueName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        filePath: relativePath,
        version: version++,
      });
    }

    await prisma.documentFile.createMany({ data: records });
    return records;
  },
};

function buildWhereClause(
  filters: Omit<DocumentQuery, 'page' | 'limit' | 'sortBy' | 'sortOrder'>,
): Prisma.DocumentWhereInput {
  const where: Prisma.DocumentWhereInput = { deletedAt: null };
  const now = new Date();

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.folder) {
    if (filters.folder === '/') {
      where.folder = '/';
    } else {
      where.AND = [
        ...(where.AND ? (where.AND as Prisma.DocumentWhereInput[]) : []),
        {
          OR: [
            { folder: filters.folder },
            { folder: { startsWith: `${filters.folder}/` } },
          ],
        },
      ];
    }
  }

  if (filters.storageType) {
    where.storageType = filters.storageType;
  }

  if (filters.tags) {
    const tagList = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
    where.tags = { hasSome: tagList };
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { documentNumber: { contains: filters.search, mode: 'insensitive' } },
      { tags: { hasSome: [filters.search] } },
      { issuer: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.expiryStatus === 'expiring_soon') {
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    where.expiryDate = { gt: now, lte: thirtyDaysFromNow };
  } else if (filters.expiryStatus === 'expired') {
    where.expiryDate = { lte: now };
  }

  if (filters.expiryDateFrom || filters.expiryDateTo) {
    where.expiryDate = {
      ...(where.expiryDate as Prisma.DateTimeNullableFilter || {}),
      ...(filters.expiryDateFrom ? { gte: new Date(filters.expiryDateFrom) } : {}),
      ...(filters.expiryDateTo ? { lte: new Date(filters.expiryDateTo) } : {}),
    };
  }

  return where;
}
