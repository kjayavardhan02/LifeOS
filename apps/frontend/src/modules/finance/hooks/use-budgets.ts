import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type {
  Budget,
  CreateBudgetInput,
  UpdateBudgetInput,
  ApiResponse,
} from '@lifeos/shared';

const BUDGETS_KEY = ['budgets'];
const TRANSACTIONS_KEY = ['transactions'];

export function useBudgets(month: number, year: number) {
  return useQuery({
    queryKey: [...BUDGETS_KEY, month, year],
    queryFn: () =>
      api.get<ApiResponse<Budget[]>>(
        `/finance/budgets?month=${month}&year=${year}`,
      ),
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBudgetInput) =>
      api.post<ApiResponse<Budget>>('/finance/budgets', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_KEY });
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
      toast.success('Budget created');
    },
    onError: (err: Error) =>
      toast.error(err.message || 'Failed to create budget'),
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateBudgetInput & { id: string }) =>
      api.patch<ApiResponse<Budget>>(`/finance/budgets/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_KEY });
      toast.success('Budget updated');
    },
    onError: (err: Error) =>
      toast.error(err.message || 'Failed to update budget'),
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/finance/budgets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_KEY });
      toast.success('Budget deleted');
    },
    onError: (err: Error) =>
      toast.error(err.message || 'Failed to delete budget'),
  });
}
