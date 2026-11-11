import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type {
  QuickCaptureResult,
  QuickCaptureParseResult,
  QuickCaptureInput,
  ApiResponse,
} from '@lifeos/shared';

const CAPTURES_KEY = ['quick-captures'];

export function useCapture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: QuickCaptureInput) =>
      api.post<ApiResponse<QuickCaptureResult & { preview: string }>>('/quick-capture', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAPTURES_KEY });
      toast.success('Captured successfully');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to capture'),
  });
}

export function useParseCapture() {
  return useMutation({
    mutationFn: (input: QuickCaptureInput) =>
      api.post<ApiResponse<QuickCaptureParseResult>>('/quick-capture/parse', input),
  });
}

export function useRecentCaptures(limit = 20) {
  return useQuery({
    queryKey: [...CAPTURES_KEY, 'recent', limit],
    queryFn: () =>
      api.get<{ data: QuickCaptureResult[] }>(`/quick-capture/recent?limit=${limit}`),
  });
}

export function useDeleteCapture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/quick-capture/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAPTURES_KEY });
      toast.success('Capture removed');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete capture'),
  });
}
