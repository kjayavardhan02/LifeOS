export interface KnowledgeNote {
  id: string;
  title: string;
  content: string | null;
  filePath: string | null;
  folder: string;
  tags: string[];
  aliases: string[];
  isQuickNote: boolean;
  isPinned: boolean;
  isArchived: boolean;
  fileSize: number | null;
  lastModified: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string | null;
  favicon: string | null;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuickNoteInput {
  title: string;
  content?: string;
  tags?: string[];
  folder?: string;
}

export interface UpdateQuickNoteInput {
  title?: string;
  content?: string | null;
  tags?: string[];
  folder?: string;
  isPinned?: boolean;
  isArchived?: boolean;
}

export interface CreateBookmarkInput {
  url: string;
  title: string;
  description?: string;
  favicon?: string;
  tags?: string[];
}

export interface UpdateBookmarkInput {
  url?: string;
  title?: string;
  description?: string | null;
  favicon?: string | null;
  tags?: string[];
  isPinned?: boolean;
  isArchived?: boolean;
}

export interface KnowledgeFilters {
  search?: string;
  folder?: string;
  tags?: string[];
  isPinned?: boolean;
  isArchived?: boolean;
  isQuickNote?: boolean;
}

export interface BookmarkFilters {
  search?: string;
  tags?: string[];
  isPinned?: boolean;
  isArchived?: boolean;
}

export interface VaultStats {
  totalNotes: number;
  quickNotes: number;
  vaultNotes: number;
  pinnedNotes: number;
  folders: string[];
  tagCloud: { tag: string; count: number }[];
}
