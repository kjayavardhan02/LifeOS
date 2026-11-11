import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { UserSettings, ApiResponse, UpdateSettingsInput } from '@lifeos/shared';

const SETTINGS_KEY = ['settings'];

export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: () => api.get<ApiResponse<UserSettings>>('/profile/me/settings'),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateSettingsInput) =>
      api.patch<ApiResponse<UserSettings>>('/profile/me/settings', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
      toast.success('Settings saved');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to save settings'),
  });
}
