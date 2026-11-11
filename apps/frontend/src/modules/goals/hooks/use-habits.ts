import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type {
  Habit,
  HabitLog,
  HabitStats,
  CreateHabitInput,
  UpdateHabitInput,
  HabitFilters,
  PaginatedResponse,
  PaginationParams,
  ApiResponse,
} from '@lifeos/shared';

type HabitQueryParams = HabitFilters & PaginationParams;

const HABITS_KEY = ['habits'];

function buildQueryString(params: HabitQueryParams): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    searchParams.set(key, String(value));
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

export function useHabits(params: HabitQueryParams = {}) {
  return useQuery({
    queryKey: [...HABITS_KEY, params],
    queryFn: () => api.get<PaginatedResponse<Habit>>(`/habits${buildQueryString(params)}`),
  });
}

export function useHabit(id: string | undefined) {
  return useQuery({
    queryKey: [...HABITS_KEY, id],
    queryFn: () => api.get<ApiResponse<Habit>>(`/habits/${id}`),
    enabled: !!id,
  });
}

export function useHabitStats() {
  return useQuery({
    queryKey: [...HABITS_KEY, 'stats'],
    queryFn: () => api.get<ApiResponse<HabitStats>>('/habits/stats'),
  });
}

export function useTodayChecklist() {
  return useQuery({
    queryKey: [...HABITS_KEY, 'today'],
    queryFn: () => api.get<ApiResponse<Array<Habit & { todayLog: HabitLog | null }>>>('/habits/today'),
  });
}

export function useHabitLogs(habitId: string | undefined, startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...HABITS_KEY, habitId, 'logs', startDate, endDate],
    queryFn: () =>
      api.get<ApiResponse<HabitLog[]>>(`/habits/${habitId}/logs?startDate=${startDate}&endDate=${endDate}`),
    enabled: !!habitId,
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateHabitInput) =>
      api.post<ApiResponse<Habit>>('/habits', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_KEY });
      toast.success('Habit created');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create habit'),
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateHabitInput & { id: string }) =>
      api.patch<ApiResponse<Habit>>(`/habits/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_KEY });
      toast.success('Habit updated');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update habit'),
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/habits/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_KEY });
      toast.success('Habit deleted');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete habit'),
  });
}

export function useLogHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ habitId, date, value, note }: { habitId: string; date: string; value?: number; note?: string }) =>
      api.post<ApiResponse<HabitLog | null>>(`/habits/${habitId}/log`, { date, value, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_KEY });
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to log habit'),
  });
}
