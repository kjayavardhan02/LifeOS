import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type {
  ContentItem,
  ContentCollection,
  ContentHighlight,
  CreateContentItemInput,
  UpdateContentItemInput,
  ContentItemFilters,
  CreateCollectionInput,
  UpdateCollectionInput,
  CreateHighlightInput,
  ReadingStats,
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
} from '@lifeos/shared';

type ContentItemQueryParams = ContentItemFilters & PaginationParams;

const READING_KEY = ['reading'];
const COLLECTIONS_KEY = ['reading', 'collections'];
const STATS_KEY = ['reading', 'stats'];

function buildQueryString(params: ContentItemQueryParams): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      for (const v of value) searchParams.append(key, String(v));
    } else {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

export function useContentItems(params: ContentItemQueryParams = {}) {
  return useQuery({
    queryKey: [...READING_KEY, 'items', params],
    queryFn: () =>
      api.get<PaginatedResponse<ContentItem>>(
        `/reading${buildQueryString(params)}`,
      ),
  });
}

export function useContentItem(id: string | null) {
  return useQuery({
    queryKey: [...READING_KEY, 'item', id],
    queryFn: () =>
      api.get<ApiResponse<ContentItem>>(`/reading/${id}`),
    enabled: !!id,
  });
}

export function useCreateContentItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateContentItemInput) =>
      api.post<ApiResponse<ContentItem>>('/reading', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: READING_KEY });
      queryClient.invalidateQueries({ queryKey: STATS_KEY });
      toast.success('Content added');
    },
    onError: (err: Error) =>
      toast.error(err.message || 'Failed to add content'),
  });
}

export function useUpdateContentItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateContentItemInput & { id: string }) =>
      api.patch<ApiResponse<ContentItem>>(`/reading/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: READING_KEY });
      queryClient.invalidateQueries({ queryKey: STATS_KEY });
      toast.success('Content updated');
    },
    onError: (err: Error) =>
      toast.error(err.message || 'Failed to update content'),
  });
}

export function useDeleteContentItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/reading/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: READING_KEY });
      queryClient.invalidateQueries({ queryKey: STATS_KEY });
      toast.success('Content deleted');
    },
    onError: (err: Error) =>
      toast.error(err.message || 'Failed to delete content'),
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      api.patch<ApiResponse<ContentItem>>(`/reading/${id}`, { isFavorite }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: READING_KEY });
      queryClient.invalidateQueries({ queryKey: STATS_KEY });
    },
    onError: (err: Error) =>
      toast.error(err.message || 'Failed to toggle favorite'),
  });
}

// ── Collections ────────────────────────────────────────────────────

export function useCollections() {
  return useQuery({
    queryKey: COLLECTIONS_KEY,
    queryFn: () =>
      api.get<ApiResponse<ContentCollection[]>>('/reading/collections'),
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCollectionInput) =>
      api.post<ApiResponse<ContentCollection>>('/reading/collections', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_KEY });
      toast.success('Collection created');
    },
    onError: (err: Error) =>
      toast.error(err.message || 'Failed to create collection'),
  });
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateCollectionInput & { id: string }) =>
      api.patch<ApiResponse<ContentCollection>>(`/reading/collections/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_KEY });
      toast.success('Collection updated');
    },
    onError: (err: Error) =>
      toast.error(err.message || 'Failed to update collection'),
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/reading/collections/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_KEY });
      queryClient.invalidateQueries({ queryKey: READING_KEY });
      toast.success('Collection deleted');
    },
    onError: (err: Error) =>
      toast.error(err.message || 'Failed to delete collection'),
  });
}

// ── Highlights ─────────────────────────────────────────────────────

export function useAddHighlight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contentItemId, ...input }: CreateHighlightInput & { contentItemId: string }) =>
      api.post<ApiResponse<ContentHighlight>>(`/reading/${contentItemId}/highlights`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: READING_KEY });
      toast.success('Highlight added');
    },
    onError: (err: Error) =>
      toast.error(err.message || 'Failed to add highlight'),
  });
}

export function useDeleteHighlight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contentItemId, highlightId }: { contentItemId: string; highlightId: string }) =>
      api.delete(`/reading/${contentItemId}/highlights/${highlightId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: READING_KEY });
      toast.success('Highlight removed');
    },
    onError: (err: Error) =>
      toast.error(err.message || 'Failed to remove highlight'),
  });
}

// ── Stats ──────────────────────────────────────────────────────────

export function useReadingStats() {
  return useQuery({
    queryKey: STATS_KEY,
    queryFn: () =>
      api.get<ApiResponse<ReadingStats>>('/reading/stats'),
  });
}
