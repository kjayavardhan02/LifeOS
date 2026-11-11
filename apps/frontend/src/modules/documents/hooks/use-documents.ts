import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type {
  Document,
  DocumentStats,
  DocumentFilters,
  DocumentFolderEntry,
  CreateDocumentInput,
  UpdateDocumentInput,
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
} from '@lifeos/shared';

type DocumentQueryParams = DocumentFilters & PaginationParams;

const DOCUMENTS_KEY = ['documents'];

function buildQueryString(params: DocumentQueryParams): string {
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

export function useDocuments(params: DocumentQueryParams = {}) {
  return useQuery({
    queryKey: [...DOCUMENTS_KEY, params],
    queryFn: () => api.get<PaginatedResponse<Document>>(`/documents${buildQueryString(params)}`),
  });
}

export function useDocument(id: string | undefined) {
  return useQuery({
    queryKey: [...DOCUMENTS_KEY, id],
    queryFn: () => api.get<ApiResponse<Document>>(`/documents/${id}`),
    enabled: !!id,
  });
}

export function useDocumentStats() {
  return useQuery({
    queryKey: [...DOCUMENTS_KEY, 'stats'],
    queryFn: () => api.get<ApiResponse<DocumentStats>>('/documents/stats'),
  });
}

export function useExpiringDocuments(days: number = 30) {
  return useQuery({
    queryKey: [...DOCUMENTS_KEY, 'expiring', days],
    queryFn: () => api.get<ApiResponse<Document[]>>(`/documents/expiring?days=${days}`),
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      data: CreateDocumentInput;
      files?: File[];
    }) => {
      const formData = new FormData();
      formData.append('name', input.data.name);
      if (input.data.description) formData.append('description', input.data.description);
      if (input.data.category) formData.append('category', input.data.category);
      if (input.data.folder) formData.append('folder', input.data.folder);
      if (input.data.tags?.length) formData.append('tags', JSON.stringify(input.data.tags));
      if (input.data.documentNumber) formData.append('documentNumber', input.data.documentNumber);
      if (input.data.issuer) formData.append('issuer', input.data.issuer);
      if (input.data.issueDate) formData.append('issueDate', input.data.issueDate);
      if (input.data.expiryDate) formData.append('expiryDate', input.data.expiryDate);
      if (input.data.notes) formData.append('notes', input.data.notes);
      if (input.data.storageType) formData.append('storageType', input.data.storageType);
      if (input.data.externalUrl) formData.append('externalUrl', input.data.externalUrl);

      if (input.files) {
        for (const file of input.files) {
          formData.append('files', file);
        }
      }

      const token = useAuthStore.getState().token;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: { message: 'Upload failed' } }));
        throw new Error(error.error?.message || `HTTP ${res.status}`);
      }

      return res.json() as Promise<ApiResponse<Document>>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      toast.success('Document created');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create document'),
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateDocumentInput & { id: string }) =>
      api.patch<ApiResponse<Document>>(`/documents/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      toast.success('Document updated');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update document'),
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/documents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      toast.success('Document deleted');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete document'),
  });
}

export function useUploadFiles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ documentId, files }: { documentId: string; files: File[] }) => {
      const formData = new FormData();
      for (const file of files) {
        formData.append('files', file);
      }

      const token = useAuthStore.getState().token;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/documents/${documentId}/files`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: { message: 'Upload failed' } }));
        throw new Error(error.error?.message || `HTTP ${res.status}`);
      }

      return res.json() as Promise<ApiResponse<Document>>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      toast.success('Files uploaded');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to upload files'),
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, fileId }: { documentId: string; fileId: string }) =>
      api.delete(`/documents/${documentId}/files/${fileId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      toast.success('File deleted');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete file'),
  });
}

const FOLDERS_KEY = ['document-folders'];

export function useDocumentFolders() {
  return useQuery({
    queryKey: FOLDERS_KEY,
    queryFn: () => api.get<ApiResponse<DocumentFolderEntry[]>>('/documents/folders'),
  });
}
