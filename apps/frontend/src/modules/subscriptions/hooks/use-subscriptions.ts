import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type {
  Subscription,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  SubscriptionFilters,
  SubscriptionSummary,
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
} from '@lifeos/shared';

type SubscriptionQueryParams = SubscriptionFilters & PaginationParams;

const SUBSCRIPTIONS_KEY = ['subscriptions'];

function buildQueryString(params: SubscriptionQueryParams): string {
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

export function useSubscriptions(params: SubscriptionQueryParams = {}) {
  return useQuery({
    queryKey: [...SUBSCRIPTIONS_KEY, params],
    queryFn: () => api.get<PaginatedResponse<Subscription>>(`/subscriptions${buildQueryString(params)}`),
  });
}

export function useSubscription(id: string | null) {
  return useQuery({
    queryKey: [...SUBSCRIPTIONS_KEY, 'detail', id],
    queryFn: () => api.get<ApiResponse<Subscription & { transactions: unknown[] }>>(`/subscriptions/${id}`),
    enabled: !!id,
  });
}

export function useSubscriptionSummary() {
  return useQuery({
    queryKey: [...SUBSCRIPTIONS_KEY, 'summary'],
    queryFn: () => api.get<ApiResponse<SubscriptionSummary>>('/subscriptions/summary'),
  });
}

export function useUpcomingRenewals(days: number = 7) {
  return useQuery({
    queryKey: [...SUBSCRIPTIONS_KEY, 'upcoming', days],
    queryFn: () => api.get<ApiResponse<Subscription[]>>(`/subscriptions/upcoming?days=${days}`),
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSubscriptionInput) =>
      api.post<ApiResponse<Subscription>>('/subscriptions', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY });
      toast.success('Subscription created');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create subscription'),
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateSubscriptionInput & { id: string }) =>
      api.patch<ApiResponse<Subscription>>(`/subscriptions/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY });
      toast.success('Subscription updated');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update subscription'),
  });
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/subscriptions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY });
      toast.success('Subscription deleted');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete subscription'),
  });
}
