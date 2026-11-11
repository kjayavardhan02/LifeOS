import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type {
  KnowledgeNote,
  Bookmark,
  CreateQuickNoteInput,
  UpdateQuickNoteInput,
  CreateBookmarkInput,
  UpdateBookmarkInput,
  KnowledgeFilters,
  BookmarkFilters,
  VaultStats,
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
} from '@lifeos/shared';

type NoteQueryParams = KnowledgeFilters & PaginationParams;
type BookmarkQueryParams = BookmarkFilters & PaginationParams;

const NOTES_KEY = ['knowledge-notes'];
const BOOKMARKS_KEY = ['knowledge-bookmarks'];
const STATS_KEY = ['knowledge-stats'];
const FOLDERS_KEY = ['knowledge-folders'];

function buildQueryString(params: NoteQueryParams | BookmarkQueryParams): string {
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

// --- Notes ---

export function useNotes(params: NoteQueryParams = {}) {
  return useQuery({
    queryKey: [...NOTES_KEY, params],
    queryFn: () =>
      api.get<PaginatedResponse<KnowledgeNote>>(
        `/knowledge/notes${buildQueryString(params)}`,
      ),
  });
}

export function useNote(id: string | undefined) {
  return useQuery({
    queryKey: [...NOTES_KEY, id],
    queryFn: () => api.get<ApiResponse<KnowledgeNote>>(`/knowledge/notes/${id}`),
    enabled: !!id,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateQuickNoteInput) =>
      api.post<ApiResponse<KnowledgeNote>>('/knowledge/notes', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
      queryClient.invalidateQueries({ queryKey: STATS_KEY });
      queryClient.invalidateQueries({ queryKey: FOLDERS_KEY });
      toast.success('Note created');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create note'),
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateQuickNoteInput & { id: string }) =>
      api.patch<ApiResponse<KnowledgeNote>>(`/knowledge/notes/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
      queryClient.invalidateQueries({ queryKey: STATS_KEY });
      toast.success('Note updated');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update note'),
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/knowledge/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
      queryClient.invalidateQueries({ queryKey: STATS_KEY });
      toast.success('Note deleted');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete note'),
  });
}

export function useToggleNotePin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<ApiResponse<KnowledgeNote>>(`/knowledge/notes/${id}/pin`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
      queryClient.invalidateQueries({ queryKey: STATS_KEY });
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to toggle pin'),
  });
}

export function useToggleNoteArchive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<ApiResponse<KnowledgeNote>>(`/knowledge/notes/${id}/archive`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
      queryClient.invalidateQueries({ queryKey: STATS_KEY });
      toast.success('Archive toggled');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to toggle archive'),
  });
}

export function useScanVault() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post<ApiResponse<{ scanned: number; created: number; updated: number; deleted: number }>>(
        '/knowledge/scan',
        {},
      ),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
      queryClient.invalidateQueries({ queryKey: STATS_KEY });
      queryClient.invalidateQueries({ queryKey: FOLDERS_KEY });
      const d = result.data;
      toast.success(`Vault scanned: ${d.scanned} files, ${d.created} new, ${d.updated} updated`);
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to scan vault'),
  });
}

export function useVaultStats() {
  return useQuery({
    queryKey: STATS_KEY,
    queryFn: () => api.get<ApiResponse<VaultStats>>('/knowledge/stats'),
  });
}

export interface FolderEntry {
  folder: string;
  count: number;
}

export function useFolders() {
  return useQuery({
    queryKey: FOLDERS_KEY,
    queryFn: () => api.get<ApiResponse<FolderEntry[]>>('/knowledge/folders'),
  });
}

// --- Bookmarks ---

export function useBookmarks(params: BookmarkQueryParams = {}) {
  return useQuery({
    queryKey: [...BOOKMARKS_KEY, params],
    queryFn: () =>
      api.get<PaginatedResponse<Bookmark>>(
        `/knowledge/bookmarks${buildQueryString(params)}`,
      ),
  });
}

export function useCreateBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookmarkInput) =>
      api.post<ApiResponse<Bookmark>>('/knowledge/bookmarks', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKMARKS_KEY });
      toast.success('Bookmark created');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create bookmark'),
  });
}

export function useUpdateBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateBookmarkInput & { id: string }) =>
      api.patch<ApiResponse<Bookmark>>(`/knowledge/bookmarks/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKMARKS_KEY });
      toast.success('Bookmark updated');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update bookmark'),
  });
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/knowledge/bookmarks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKMARKS_KEY });
      toast.success('Bookmark deleted');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete bookmark'),
  });
}

export function useToggleBookmarkPin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<ApiResponse<Bookmark>>(`/knowledge/bookmarks/${id}/pin`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKMARKS_KEY });
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to toggle pin'),
  });
}
