import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type {
  Goal,
  GoalStats,
  GoalMilestone,
  CreateGoalInput,
  UpdateGoalInput,
  CreateGoalMilestoneInput,
  UpdateGoalMilestoneInput,
  GoalFilters,
  PaginatedResponse,
  PaginationParams,
  ApiResponse,
} from '@lifeos/shared';

type GoalQueryParams = GoalFilters & PaginationParams;

interface GoalListItem extends Omit<Goal, 'milestones' | 'linkedTasks' | 'linkedHabits'> {
  _count: { milestones: number; linkedTasks: number };
}

const GOALS_KEY = ['goals'];

function buildQueryString(params: GoalQueryParams): string {
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

export function useGoals(params: GoalQueryParams = {}) {
  return useQuery({
    queryKey: [...GOALS_KEY, params],
    queryFn: () => api.get<PaginatedResponse<GoalListItem>>(`/goals${buildQueryString(params)}`),
  });
}

export function useGoal(id: string | undefined) {
  return useQuery({
    queryKey: [...GOALS_KEY, id],
    queryFn: () => api.get<ApiResponse<Goal>>(`/goals/${id}`),
    enabled: !!id,
  });
}

export function useGoalStats() {
  return useQuery({
    queryKey: [...GOALS_KEY, 'stats'],
    queryFn: () => api.get<ApiResponse<GoalStats>>('/goals/stats'),
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGoalInput) =>
      api.post<ApiResponse<Goal>>('/goals', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_KEY });
      toast.success('Goal created');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create goal'),
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateGoalInput & { id: string }) =>
      api.patch<ApiResponse<Goal>>(`/goals/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_KEY });
      toast.success('Goal updated');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update goal'),
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/goals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_KEY });
      toast.success('Goal deleted');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete goal'),
  });
}

export function useAddGoalMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, ...input }: CreateGoalMilestoneInput & { goalId: string }) =>
      api.post<ApiResponse<GoalMilestone>>(`/goals/${goalId}/milestones`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_KEY });
      toast.success('Milestone added');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to add milestone'),
  });
}

export function useUpdateGoalMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      goalId,
      milestoneId,
      ...input
    }: UpdateGoalMilestoneInput & { goalId: string; milestoneId: string }) =>
      api.patch<ApiResponse<GoalMilestone>>(`/goals/${goalId}/milestones/${milestoneId}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_KEY });
      toast.success('Milestone updated');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update milestone'),
  });
}

export function useDeleteGoalMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, milestoneId }: { goalId: string; milestoneId: string }) =>
      api.delete(`/goals/${goalId}/milestones/${milestoneId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_KEY });
      toast.success('Milestone deleted');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete milestone'),
  });
}

export function useLinkTaskToGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, taskId }: { goalId: string; taskId: string }) =>
      api.post<ApiResponse<unknown>>(`/goals/${goalId}/tasks/${taskId}/link`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_KEY });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task linked to goal');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to link task'),
  });
}

export function useUnlinkTaskFromGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, taskId }: { goalId: string; taskId: string }) =>
      api.delete(`/goals/${goalId}/tasks/${taskId}/link`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_KEY });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task unlinked');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to unlink task'),
  });
}

export function useLinkHabitToGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, habitId }: { goalId: string; habitId: string }) =>
      api.post<ApiResponse<unknown>>(`/goals/${goalId}/habits/${habitId}/link`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_KEY });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Habit linked to goal');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to link habit'),
  });
}

export function useUnlinkHabitFromGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, habitId }: { goalId: string; habitId: string }) =>
      api.delete(`/goals/${goalId}/habits/${habitId}/link`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_KEY });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Habit unlinked');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to unlink habit'),
  });
}

export type { GoalListItem };
