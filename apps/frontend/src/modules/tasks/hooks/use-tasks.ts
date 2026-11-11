import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type {
  Task,
  TaskActivity,
  Subtask,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
} from '@lifeos/shared';

type TaskQueryParams = TaskFilters & PaginationParams;

const TASKS_KEY = ['tasks'];

function buildQueryString(params: TaskQueryParams): string {
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

export function useTasks(params: TaskQueryParams = {}) {
  return useQuery({
    queryKey: [...TASKS_KEY, params],
    queryFn: () => api.get<PaginatedResponse<Task>>(`/tasks${buildQueryString(params)}`),
  });
}

export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: [...TASKS_KEY, id],
    queryFn: () => api.get<ApiResponse<Task>>(`/tasks/${id}`),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) =>
      api.post<ApiResponse<Task>>('/tasks', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      toast.success('Task created');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create task'),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateTaskInput & { id: string }) =>
      api.patch<ApiResponse<Task>>(`/tasks/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      toast.success('Task updated');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update task'),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      toast.success('Task deleted');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete task'),
  });
}

export function useAddSubtask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, title }: { taskId: string; title: string }) =>
      api.post<ApiResponse<Subtask>>(`/tasks/${taskId}/subtasks`, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      toast.success('Subtask added');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to add subtask'),
  });
}

export function useUpdateSubtask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      subtaskId,
      ...input
    }: {
      taskId: string;
      subtaskId: string;
      title?: string;
      isCompleted?: boolean;
    }) => api.patch<ApiResponse<Subtask>>(`/tasks/${taskId}/subtasks/${subtaskId}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      toast.success('Subtask updated');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update subtask'),
  });
}

export function useDeleteSubtask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, subtaskId }: { taskId: string; subtaskId: string }) =>
      api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      toast.success('Subtask deleted');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete subtask'),
  });
}

export function useTaskActivities(taskId: string | undefined) {
  return useQuery({
    queryKey: [...TASKS_KEY, taskId, 'activities'],
    queryFn: () => api.get<ApiResponse<TaskActivity[]>>(`/tasks/${taskId}/activities`),
    enabled: !!taskId,
  });
}
