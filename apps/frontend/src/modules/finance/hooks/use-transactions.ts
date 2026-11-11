import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type {
  FinanceTransaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilters,
  FinanceSummary,
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
} from '@lifeos/shared';

type TransactionQueryParams = TransactionFilters & PaginationParams;

const TRANSACTIONS_KEY = ['transactions'];

function buildQueryString(params: TransactionQueryParams): string {
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

export function useTransactions(params: TransactionQueryParams = {}) {
  return useQuery({
    queryKey: [...TRANSACTIONS_KEY, params],
    queryFn: () =>
      api.get<PaginatedResponse<FinanceTransaction>>(
        `/finance/transactions${buildQueryString(params)}`,
      ),
  });
}

export function useTransaction(id: string | null) {
  return useQuery({
    queryKey: [...TRANSACTIONS_KEY, id],
    queryFn: () =>
      api.get<ApiResponse<FinanceTransaction>>(`/finance/transactions/${id}`),
    enabled: !!id,
  });
}

export function useRecentTransactions(limit = 5) {
  return useQuery({
    queryKey: [...TRANSACTIONS_KEY, 'recent', limit],
    queryFn: () =>
      api.get<ApiResponse<FinanceTransaction[]>>(
        `/finance/transactions/recent?limit=${limit}`,
      ),
  });
}

export function useFinanceSummary(month: number, year: number) {
  return useQuery({
    queryKey: [...TRANSACTIONS_KEY, 'summary', month, year],
    queryFn: () =>
      api.get<ApiResponse<FinanceSummary>>(
        `/finance/transactions/summary?month=${month}&year=${year}`,
      ),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTransactionInput) =>
      api.post<ApiResponse<FinanceTransaction>>('/finance/transactions', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
      toast.success('Transaction created');
    },
    onError: (err: Error) =>
      toast.error(err.message || 'Failed to create transaction'),
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateTransactionInput & { id: string }) =>
      api.patch<ApiResponse<FinanceTransaction>>(
        `/finance/transactions/${id}`,
        input,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
      toast.success('Transaction updated');
    },
    onError: (err: Error) =>
      toast.error(err.message || 'Failed to update transaction'),
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/finance/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
      toast.success('Transaction deleted');
    },
    onError: (err: Error) =>
      toast.error(err.message || 'Failed to delete transaction'),
  });
}
