import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type {
  CalendarEvent,
  CreateEventInput,
  UpdateEventInput,
  EventFilters,
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
} from '@lifeos/shared';

type EventQueryParams = EventFilters & PaginationParams;

const EVENTS_KEY = ['events'];

function buildQueryString(params: EventQueryParams): string {
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

export function useEvents(params: EventQueryParams = {}) {
  return useQuery({
    queryKey: [...EVENTS_KEY, params],
    queryFn: () => api.get<PaginatedResponse<CalendarEvent>>(`/events${buildQueryString(params)}`),
  });
}

export function useUpcomingEvents(days: number = 7) {
  return useQuery({
    queryKey: [...EVENTS_KEY, 'upcoming', days],
    queryFn: () => api.get<ApiResponse<CalendarEvent[]>>(`/events/upcoming?days=${days}`),
  });
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: [...EVENTS_KEY, id],
    queryFn: () => api.get<ApiResponse<CalendarEvent>>(`/events/${id}`),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEventInput) =>
      api.post<ApiResponse<CalendarEvent>>('/events', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_KEY });
      toast.success('Event created');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create event'),
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateEventInput & { id: string }) =>
      api.patch<ApiResponse<CalendarEvent>>(`/events/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_KEY });
      toast.success('Event updated');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update event'),
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_KEY });
      toast.success('Event deleted');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete event'),
  });
}
