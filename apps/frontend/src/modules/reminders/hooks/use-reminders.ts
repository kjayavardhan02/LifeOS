import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type {
  Reminder,
  CreateReminderInput,
  UpdateReminderInput,
  ReminderFilters,
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
} from '@lifeos/shared';

type ReminderQueryParams = ReminderFilters & PaginationParams;

const REMINDERS_KEY = ['reminders'];

function buildQueryString(params: ReminderQueryParams): string {
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

export function useReminders(params: ReminderQueryParams = {}) {
  return useQuery({
    queryKey: [...REMINDERS_KEY, params],
    queryFn: () => api.get<PaginatedResponse<Reminder>>(`/reminders${buildQueryString(params)}`),
  });
}

export function useActiveReminders() {
  return useQuery({
    queryKey: [...REMINDERS_KEY, 'active'],
    queryFn: () => api.get<ApiResponse<Reminder[]>>('/reminders/active'),
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReminderInput) =>
      api.post<ApiResponse<Reminder>>('/reminders', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDERS_KEY });
      toast.success('Reminder created');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create reminder'),
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateReminderInput & { id: string }) =>
      api.patch<ApiResponse<Reminder>>(`/reminders/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDERS_KEY });
      toast.success('Reminder updated');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update reminder'),
  });
}

export function useSnoozeReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, minutes }: { id: string; minutes: number }) =>
      api.post<ApiResponse<Reminder>>(`/reminders/${id}/snooze`, { minutes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDERS_KEY });
      toast.success('Reminder snoozed');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to snooze reminder'),
  });
}

export function useDismissReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post<ApiResponse<Reminder>>(`/reminders/${id}/dismiss`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDERS_KEY });
      toast.success('Reminder dismissed');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to dismiss reminder'),
  });
}

export function useMarkReminderDone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post<ApiResponse<Reminder>>(`/reminders/${id}/done`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDERS_KEY });
      toast.success('Reminder completed');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to complete reminder'),
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/reminders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDERS_KEY });
      toast.success('Reminder deleted');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete reminder'),
  });
}
