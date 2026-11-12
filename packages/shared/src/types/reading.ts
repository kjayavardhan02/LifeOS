export type ContentType = 'article' | 'book' | 'video' | 'podcast';

export type ContentStatus = 'queued' | 'in_progress' | 'completed' | 'dropped';

export interface ContentItem {
  id: string;
  title: string;
  url?: string | null;
  type: ContentType;
  status: ContentStatus;
  category: string;
  tags: string[];
  rating?: number | null;
  notes?: string | null;
  source?: string | null;
  currentPage?: number | null;
  totalPages?: number | null;
  isFavorite: boolean;
  collectionId?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  collection?: ContentCollection | null;
  highlights?: ContentHighlight[];
}

export interface ContentCollection {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  _count?: { items: number };
}

export interface ContentHighlight {
  id: string;
  contentItemId: string;
  text: string;
  note?: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface CreateContentItemInput {
  title: string;
  url?: string;
  type?: ContentType;
  status?: ContentStatus;
  category?: string;
  tags?: string[];
  rating?: number | null;
  notes?: string;
  source?: string;
  currentPage?: number | null;
  totalPages?: number | null;
  isFavorite?: boolean;
  collectionId?: string | null;
}

export interface UpdateContentItemInput {
  title?: string;
  url?: string | null;
  type?: ContentType;
  status?: ContentStatus;
  category?: string;
  tags?: string[];
  rating?: number | null;
  notes?: string | null;
  source?: string | null;
  currentPage?: number | null;
  totalPages?: number | null;
  isFavorite?: boolean;
  collectionId?: string | null;
}

export interface ContentItemFilters {
  type?: ContentType;
  status?: ContentStatus;
  category?: string;
  collectionId?: string;
  isFavorite?: boolean;
  search?: string;
}

export interface CreateCollectionInput {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateCollectionInput {
  name?: string;
  description?: string | null;
  color?: string;
}

export interface CreateHighlightInput {
  text: string;
  note?: string;
  sortOrder?: number;
}

export interface ReadingStats {
  totalItems: number;
  completedThisMonth: number;
  inProgress: number;
  favorites: number;
  byType: { type: ContentType; count: number }[];
  byStatus: { status: ContentStatus; count: number }[];
  completedPerMonth: { month: string; count: number }[];
}
