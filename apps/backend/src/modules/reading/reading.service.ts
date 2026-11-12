import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error-handler.js';
import type { z } from 'zod';
import type {
  createContentItemSchema,
  updateContentItemSchema,
  contentItemQuerySchema,
  createCollectionSchema,
  updateCollectionSchema,
  createHighlightSchema,
} from './reading.validator.js';

type CreateContentItemInput = z.infer<typeof createContentItemSchema>;
type UpdateContentItemInput = z.infer<typeof updateContentItemSchema>;
type ContentItemQuery = z.infer<typeof contentItemQuerySchema>;
type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
type CreateHighlightInput = z.infer<typeof createHighlightSchema>;

export const readingService = {
  // ── Content Items ──────────────────────────────────────────────────

  async listItems(query: ContentItemQuery) {
    const { page, limit, sortBy, sortOrder, ...filters } = query;
    const where = buildItemWhereClause(filters);
    const skip = (page - 1) * limit;

    const orderBy: Record<string, string> = {};
    orderBy[sortBy] = sortOrder;

    const [data, total] = await Promise.all([
      prisma.contentItem.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          collection: { select: { id: true, name: true, color: true } },
          _count: { select: { highlights: true } },
        },
      }),
      prisma.contentItem.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getItemById(id: string) {
    const item = await prisma.contentItem.findFirst({
      where: { id, deletedAt: null },
      include: {
        collection: { select: { id: true, name: true, color: true } },
        highlights: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!item) throw new AppError(404, 'Content item not found', 'NOT_FOUND');
    return item;
  },

  async createItem(input: CreateContentItemInput) {
    return prisma.contentItem.create({
      data: {
        ...input,
        tags: input.tags ?? [],
      },
      include: {
        collection: { select: { id: true, name: true, color: true } },
      },
    });
  },

  async updateItem(id: string, input: UpdateContentItemInput) {
    const existing = await this.getItemById(id);

    const data: Prisma.ContentItemUpdateInput = { ...input };

    // Set completedAt when transitioning to completed
    if (input.status === 'completed' && existing.status !== 'completed') {
      data.completedAt = new Date();
    } else if (input.status && input.status !== 'completed') {
      data.completedAt = null;
    }

    return prisma.contentItem.update({
      where: { id },
      data,
      include: {
        collection: { select: { id: true, name: true, color: true } },
      },
    });
  },

  async deleteItem(id: string) {
    await this.getItemById(id);
    await prisma.contentItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  // ── Collections ────────────────────────────────────────────────────

  async listCollections() {
    return prisma.contentCollection.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            items: { where: { deletedAt: null } },
          },
        },
      },
    });
  },

  async createCollection(input: CreateCollectionInput) {
    return prisma.contentCollection.create({
      data: input,
      include: {
        _count: { select: { items: { where: { deletedAt: null } } } },
      },
    });
  },

  async updateCollection(id: string, input: UpdateCollectionInput) {
    const collection = await prisma.contentCollection.findFirst({
      where: { id, deletedAt: null },
    });
    if (!collection) throw new AppError(404, 'Collection not found', 'NOT_FOUND');

    return prisma.contentCollection.update({
      where: { id },
      data: input,
      include: {
        _count: { select: { items: { where: { deletedAt: null } } } },
      },
    });
  },

  async deleteCollection(id: string) {
    const collection = await prisma.contentCollection.findFirst({
      where: { id, deletedAt: null },
    });
    if (!collection) throw new AppError(404, 'Collection not found', 'NOT_FOUND');

    // Unlink items from this collection, then soft-delete
    await prisma.$transaction([
      prisma.contentItem.updateMany({
        where: { collectionId: id },
        data: { collectionId: null },
      }),
      prisma.contentCollection.update({
        where: { id },
        data: { deletedAt: new Date() },
      }),
    ]);
  },

  // ── Highlights ─────────────────────────────────────────────────────

  async addHighlight(contentItemId: string, input: CreateHighlightInput) {
    await this.getItemById(contentItemId);

    return prisma.contentHighlight.create({
      data: {
        contentItemId,
        text: input.text,
        note: input.note,
        sortOrder: input.sortOrder ?? 0,
      },
    });
  },

  async deleteHighlight(contentItemId: string, highlightId: string) {
    const highlight = await prisma.contentHighlight.findFirst({
      where: { id: highlightId, contentItemId },
    });
    if (!highlight) throw new AppError(404, 'Highlight not found', 'NOT_FOUND');

    await prisma.contentHighlight.delete({ where: { id: highlightId } });
  },

  // ── Stats ──────────────────────────────────────────────────────────

  async getStats() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const baseWhere: Prisma.ContentItemWhereInput = { deletedAt: null };

    const [
      totalItems,
      completedThisMonth,
      inProgress,
      favorites,
      byTypeRaw,
      byStatusRaw,
      completedItemsRaw,
    ] = await Promise.all([
      prisma.contentItem.count({ where: baseWhere }),
      prisma.contentItem.count({
        where: {
          ...baseWhere,
          status: 'completed',
          completedAt: { gte: monthStart, lte: monthEnd },
        },
      }),
      prisma.contentItem.count({ where: { ...baseWhere, status: 'in_progress' } }),
      prisma.contentItem.count({ where: { ...baseWhere, isFavorite: true } }),
      prisma.contentItem.groupBy({
        by: ['type'],
        where: baseWhere,
        _count: true,
      }),
      prisma.contentItem.groupBy({
        by: ['status'],
        where: baseWhere,
        _count: true,
      }),
      prisma.contentItem.findMany({
        where: { ...baseWhere, status: 'completed', completedAt: { not: null } },
        select: { completedAt: true },
        orderBy: { completedAt: 'asc' },
      }),
    ]);

    const byType = byTypeRaw.map((r) => ({ type: r.type, count: r._count }));
    const byStatus = byStatusRaw.map((r) => ({ status: r.status, count: r._count }));

    // Build completed per month (last 12 months)
    const monthMap = new Map<string, number>();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, 0);
    }

    for (const item of completedItemsRaw) {
      if (item.completedAt) {
        const key = `${item.completedAt.getFullYear()}-${String(item.completedAt.getMonth() + 1).padStart(2, '0')}`;
        if (monthMap.has(key)) {
          monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
        }
      }
    }

    const completedPerMonth = Array.from(monthMap.entries()).map(([month, count]) => ({
      month,
      count,
    }));

    return {
      totalItems,
      completedThisMonth,
      inProgress,
      favorites,
      byType,
      byStatus,
      completedPerMonth,
    };
  },
};

function buildItemWhereClause(
  filters: Omit<ContentItemQuery, 'page' | 'limit' | 'sortBy' | 'sortOrder'>,
): Prisma.ContentItemWhereInput {
  const where: Prisma.ContentItemWhereInput = { deletedAt: null };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.collectionId) {
    where.collectionId = filters.collectionId;
  }

  if (filters.isFavorite !== undefined) {
    where.isFavorite = filters.isFavorite;
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { notes: { contains: filters.search, mode: 'insensitive' } },
      { source: { contains: filters.search, mode: 'insensitive' } },
      { category: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return where;
}
