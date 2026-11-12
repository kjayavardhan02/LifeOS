import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  ProductivityStats,
  FinanceStats,
  AnalyticsHabitStats,
  AnalyticsGoalStats,
} from '@lifeos/shared';

export function useProductivityStats(period: string) {
  return useQuery({
    queryKey: ['analytics', 'productivity', period],
    queryFn: () =>
      api.get<{ data: ProductivityStats }>(`/analytics/productivity?period=${period}`),
  });
}

export function useFinanceStats(period: string) {
  return useQuery({
    queryKey: ['analytics', 'finance', period],
    queryFn: () => api.get<{ data: FinanceStats }>(`/analytics/finance?period=${period}`),
  });
}

export function useHabitStats(period: string) {
  return useQuery({
    queryKey: ['analytics', 'habits', period],
    queryFn: () => api.get<{ data: AnalyticsHabitStats }>(`/analytics/habits?period=${period}`),
  });
}

export function useGoalStats(period: string) {
  return useQuery({
    queryKey: ['analytics', 'goals', period],
    queryFn: () => api.get<{ data: AnalyticsGoalStats }>(`/analytics/goals?period=${period}`),
  });
}
