import { readdir, readFile, writeFile, mkdir, stat, access } from 'fs/promises';
import { join, relative, dirname, basename, extname } from 'path';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error-handler.js';
import type { z } from 'zod';
import type {
  createQuickNoteSchema,
  updateQuickNoteSchema,
  knowledgeQuerySchema,
  createBookmarkSchema,
  updateBookmarkSchema,
  bookmarkQuerySchema,
} from './knowledge.validator.js';

type CreateQuickNoteInput = z.infer<typeof createQuickNoteSchema>;
type UpdateQuickNoteInput = z.infer<typeof updateQuickNoteSchema>;
type KnowledgeQuery = z.infer<typeof knowledgeQuerySchema>;
type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>;
type UpdateBookmarkInput = z.infer<typeof updateBookmarkSchema>;
type BookmarkQuery = z.infer<typeof bookmarkQuerySchema>;

async function getVaultPath(userId?: string): Promise<string> {
  const where = userId
    ? { userId }
    : { obsidianVault: { not: null } as Prisma.StringNullableFilter };
  const settings = await prisma.userSettings.findFirst({
    where,
    select: { obsidianVault: true },
  });
  if (settings?.obsidianVault) return settings.obsidianVault;

  const envPath = process.env.OBSIDIAN_VAULT_PATH;
  if (envPath) return envPath;

  throw new AppError(
    400,
    'Obsidian vault path not configured. Select your vault folder in Knowledge Base.',
    'VAULT_NOT_CONFIGURED',
  );
}

function parseFrontmatter(content: string): {
  frontmatter: Record<string, unknown>;
  body: string;
} {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const raw = match[1];
  const body = match[2];
  const frontmatter: Record<string, unknown> = {};

  for (const line of raw.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value: unknown = line.slice(colonIdx + 1).trim();

    // Parse arrays in [a, b, c] format
    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    }

    if (key) frontmatter[key] = value;
  }

  return { frontmatter, body };
}

function buildFrontmatter(tags: string[]): string {
  if (tags.length === 0) return '';
  return `---\ntags: [${tags.join(', ')}]\n---\n\n`;
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '').trim();
}

function extractTitle(filePath: string, body: string): string {
  const headingMatch = body.match(/^#\s+(.+)$/m);
  if (headingMatch) return stripHtml(headingMatch[1].trim());
  return basename(filePath, extname(filePath));
}

async function walkDir(dir: string): Promise<string[]> {
  const files: string[] = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip hidden directories
      if (entry.name.startsWith('.')) continue;
      const subFiles = await walkDir(fullPath);
      files.push(...subFiles);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

export const knowledgeService = {
  async listNotes(query: KnowledgeQuery) {
    const { page, limit, sortBy, sortOrder, ...filters } = query;
    const where = buildNoteWhereClause(filters);
    const skip = (page - 1) * limit;

    const orderBy: Record<string, string> = {};
    orderBy[sortBy] = sortOrder;

    const [data, total] = await Promise.all([
      prisma.knowledgeNote.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.knowledgeNote.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getNote(id: string, userId?: string) {
    const note = await prisma.knowledgeNote.findFirst({
      where: { id, deletedAt: null },
    });
    if (!note) throw new AppError(404, 'Note not found', 'NOT_FOUND');

    // For vault files, try to read fresh content from disk
    if (!note.isQuickNote && note.filePath) {
      try {
        const vaultPath = await getVaultPath(userId);
        const fullPath = join(vaultPath, note.filePath);
        const rawContent = await readFile(fullPath, 'utf-8');
        const { body } = parseFrontmatter(rawContent);
        return { ...note, content: body };
      } catch {
        return { ...note, content: note.content || '[File not found on disk]' };
      }
    }

    return note;
  },

  async createQuickNote(input: CreateQuickNoteInput, userId?: string) {
    const vaultPath = await getVaultPath(userId);
    const notesDir = join(vaultPath, 'LifeOS-Notes');

    // Ensure LifeOS-Notes directory exists
    try {
      await mkdir(notesDir, { recursive: true });
    } catch {
      // Directory may already exist
    }

    // Create the .md file in the vault
    const safeName = input.title.replace(/[/\\?%*:|"<>]/g, '-');
    const fileName = `${safeName}.md`;
    const filePath = join('LifeOS-Notes', fileName);
    const fullPath = join(vaultPath, filePath);

    const frontmatter = buildFrontmatter(input.tags ?? []);
    const fileContent = frontmatter + (input.content || '');

    try {
      await writeFile(fullPath, fileContent, 'utf-8');
    } catch (err) {
      // Vault might not exist; still save to DB
    }

    const note = await prisma.knowledgeNote.create({
      data: {
        title: input.title,
        content: input.content || null,
        filePath,
        folder: 'LifeOS-Notes',
        tags: input.tags ?? [],
        isQuickNote: true,
      },
    });

    return note;
  },

  async updateQuickNote(id: string, input: UpdateQuickNoteInput, userId?: string) {
    const existing = await prisma.knowledgeNote.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) throw new AppError(404, 'Note not found', 'NOT_FOUND');

    const note = await prisma.knowledgeNote.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.content !== undefined && { content: input.content }),
        ...(input.tags !== undefined && { tags: input.tags }),
        ...(input.folder !== undefined && { folder: input.folder }),
        ...(input.isPinned !== undefined && { isPinned: input.isPinned }),
        ...(input.isArchived !== undefined && { isArchived: input.isArchived }),
      },
    });

    // If this is a quick note with a file path, update the file on disk
    if (existing.isQuickNote && existing.filePath) {
      const vaultPath = await getVaultPath(userId);
      const fullPath = join(vaultPath, existing.filePath);
      const tags = input.tags ?? existing.tags;
      const content = input.content !== undefined ? (input.content ?? '') : (existing.content ?? '');
      const frontmatter = buildFrontmatter(tags);
      try {
        await writeFile(fullPath, frontmatter + content, 'utf-8');
      } catch {
        // Vault might not be accessible
      }
    }

    return note;
  },

  async deleteNote(id: string) {
    const note = await prisma.knowledgeNote.findFirst({
      where: { id, deletedAt: null },
    });
    if (!note) throw new AppError(404, 'Note not found', 'NOT_FOUND');

    await prisma.knowledgeNote.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async togglePin(id: string) {
    const note = await prisma.knowledgeNote.findFirst({
      where: { id, deletedAt: null },
    });
    if (!note) throw new AppError(404, 'Note not found', 'NOT_FOUND');

    return prisma.knowledgeNote.update({
      where: { id },
      data: { isPinned: !note.isPinned },
    });
  },

  async toggleArchive(id: string) {
    const note = await prisma.knowledgeNote.findFirst({
      where: { id, deletedAt: null },
    });
    if (!note) throw new AppError(404, 'Note not found', 'NOT_FOUND');

    return prisma.knowledgeNote.update({
      where: { id },
      data: { isArchived: !note.isArchived },
    });
  },

  async scanVault(userId?: string) {
    const vaultPath = await getVaultPath(userId);

    try {
      await access(vaultPath);
    } catch {
      throw new AppError(400, `Vault path not accessible: ${vaultPath}`, 'VAULT_NOT_FOUND');
    }

    const mdFiles = await walkDir(vaultPath);
    const existingNotes = await prisma.knowledgeNote.findMany({
      where: { isQuickNote: false, deletedAt: null },
      select: { id: true, filePath: true },
    });

    const existingPaths = new Set(existingNotes.map((n) => n.filePath));
    const scannedPaths = new Set<string>();
    let created = 0;
    let updated = 0;
    let deleted = 0;

    for (const fullPath of mdFiles) {
      const relPath = relative(vaultPath, fullPath);
      scannedPaths.add(relPath);

      const rawContent = await readFile(fullPath, 'utf-8');
      const fileStat = await stat(fullPath);
      const { frontmatter, body } = parseFrontmatter(rawContent);

      const tags = Array.isArray(frontmatter.tags)
        ? (frontmatter.tags as string[])
        : typeof frontmatter.tags === 'string'
          ? [frontmatter.tags]
          : [];

      const aliases = Array.isArray(frontmatter.aliases)
        ? (frontmatter.aliases as string[])
        : typeof frontmatter.aliases === 'string'
          ? [frontmatter.aliases]
          : [];

      const title = extractTitle(relPath, body);
      const folder = dirname(relPath) === '.' ? '/' : dirname(relPath);

      const noteData = {
        title,
        folder,
        tags,
        aliases,
        isQuickNote: false,
        fileSize: fileStat.size,
        lastModified: fileStat.mtime,
      };

      if (existingPaths.has(relPath)) {
        await prisma.knowledgeNote.update({
          where: { filePath: relPath },
          data: noteData,
        });
        updated++;
      } else {
        await prisma.knowledgeNote.create({
          data: {
            ...noteData,
            filePath: relPath,
            content: null, // content is read from disk on demand
          },
        });
        created++;
      }
    }

    // Mark notes whose files no longer exist as deleted
    for (const note of existingNotes) {
      if (note.filePath && !scannedPaths.has(note.filePath)) {
        await prisma.knowledgeNote.update({
          where: { id: note.id },
          data: { deletedAt: new Date() },
        });
        deleted++;
      }
    }

    return { scanned: mdFiles.length, created, updated, deleted };
  },

  async getVaultStats() {
    const [totalNotes, quickNotes, vaultNotes, pinnedNotes] = await Promise.all([
      prisma.knowledgeNote.count({ where: { deletedAt: null } }),
      prisma.knowledgeNote.count({ where: { deletedAt: null, isQuickNote: true } }),
      prisma.knowledgeNote.count({ where: { deletedAt: null, isQuickNote: false } }),
      prisma.knowledgeNote.count({ where: { deletedAt: null, isPinned: true } }),
    ]);

    const notes = await prisma.knowledgeNote.findMany({
      where: { deletedAt: null },
      select: { folder: true, tags: true },
    });

    const folderSet = new Set<string>();
    const tagCounts: Record<string, number> = {};

    for (const note of notes) {
      folderSet.add(note.folder);
      for (const tag of note.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }

    const tagCloud = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50);

    return {
      totalNotes,
      quickNotes,
      vaultNotes,
      pinnedNotes,
      folders: Array.from(folderSet).sort(),
      tagCloud,
    };
  },

  async getFolders() {
    const notes = await prisma.knowledgeNote.findMany({
      where: { deletedAt: null },
      select: { folder: true },
    });
    const counts: Record<string, number> = {};
    for (const n of notes) {
      counts[n.folder] = (counts[n.folder] || 0) + 1;
    }
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([folder, count]) => ({ folder, count }));
  },

  // Bookmark methods

  async listBookmarks(query: BookmarkQuery) {
    const { page, limit, sortBy, sortOrder, ...filters } = query;
    const where = buildBookmarkWhereClause(filters);
    const skip = (page - 1) * limit;

    const orderBy: Record<string, string> = {};
    orderBy[sortBy] = sortOrder;

    const [data, total] = await Promise.all([
      prisma.bookmark.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.bookmark.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async createBookmark(input: CreateBookmarkInput) {
    return prisma.bookmark.create({
      data: {
        url: input.url,
        title: input.title,
        description: input.description || null,
        favicon: input.favicon || null,
        tags: input.tags ?? [],
      },
    });
  },

  async updateBookmark(id: string, input: UpdateBookmarkInput) {
    const existing = await prisma.bookmark.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) throw new AppError(404, 'Bookmark not found', 'NOT_FOUND');

    return prisma.bookmark.update({
      where: { id },
      data: {
        ...(input.url !== undefined && { url: input.url }),
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.favicon !== undefined && { favicon: input.favicon }),
        ...(input.tags !== undefined && { tags: input.tags }),
        ...(input.isPinned !== undefined && { isPinned: input.isPinned }),
        ...(input.isArchived !== undefined && { isArchived: input.isArchived }),
      },
    });
  },

  async deleteBookmark(id: string) {
    const bookmark = await prisma.bookmark.findFirst({
      where: { id, deletedAt: null },
    });
    if (!bookmark) throw new AppError(404, 'Bookmark not found', 'NOT_FOUND');

    await prisma.bookmark.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async toggleBookmarkPin(id: string) {
    const bookmark = await prisma.bookmark.findFirst({
      where: { id, deletedAt: null },
    });
    if (!bookmark) throw new AppError(404, 'Bookmark not found', 'NOT_FOUND');

    return prisma.bookmark.update({
      where: { id },
      data: { isPinned: !bookmark.isPinned },
    });
  },
};

function buildNoteWhereClause(
  filters: Omit<KnowledgeQuery, 'page' | 'limit' | 'sortBy' | 'sortOrder'>,
): Prisma.KnowledgeNoteWhereInput {
  const where: Prisma.KnowledgeNoteWhereInput = { deletedAt: null };

  if (filters.folder) {
    where.folder = filters.folder;
  }

  if (filters.tags) {
    const tagList = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
    where.tags = { hasSome: tagList };
  }

  if (filters.isPinned !== undefined) {
    where.isPinned = filters.isPinned;
  }

  if (filters.isArchived !== undefined) {
    where.isArchived = filters.isArchived;
  } else {
    // By default, hide archived notes
    where.isArchived = false;
  }

  if (filters.isQuickNote !== undefined) {
    where.isQuickNote = filters.isQuickNote;
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { content: { contains: filters.search, mode: 'insensitive' } },
      { tags: { hasSome: [filters.search] } },
    ];
  }

  return where;
}

function buildBookmarkWhereClause(
  filters: Omit<BookmarkQuery, 'page' | 'limit' | 'sortBy' | 'sortOrder'>,
): Prisma.BookmarkWhereInput {
  const where: Prisma.BookmarkWhereInput = { deletedAt: null };

  if (filters.tags) {
    const tagList = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
    where.tags = { hasSome: tagList };
  }

  if (filters.isPinned !== undefined) {
    where.isPinned = filters.isPinned;
  }

  if (filters.isArchived !== undefined) {
    where.isArchived = filters.isArchived;
  } else {
    where.isArchived = false;
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { url: { contains: filters.search, mode: 'insensitive' } },
      { tags: { hasSome: [filters.search] } },
    ];
  }

  return where;
}
