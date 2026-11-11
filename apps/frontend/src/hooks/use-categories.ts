import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { Category, CreateCategoryInput, CategoryType, ApiResponse } from '@lifeos/shared';

const CATEGORIES_KEY = ['categories'];

export function useCategories(type?: CategoryType) {
  return useQuery({
    queryKey: [...CATEGORIES_KEY, type],
    queryFn: () =>
      api.get<ApiResponse<Category[]>>(
        type ? `/categories?type=${type}` : '/categories',
      ),
  });
}

export function useCategoryNames(type: CategoryType): string[] {
  const { data } = useCategories(type);
  return (data?.data ?? []).map((c) => c.name);
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) =>
      api.post<ApiResponse<Category>>('/categories', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      toast.success('Category added');
    },
    onError: (err: Error) =>
      toast.error(err.message || 'Failed to add category'),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      toast.success('Category deleted');
    },
    onError: (err: Error) =>
      toast.error(err.message || 'Failed to delete category'),
  });
}
