import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type { User, ApiResponse, UpdateProfileInput, ChangePasswordInput } from '@lifeos/shared';

export function useUpdateProfile() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);

  return useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      api.patch<ApiResponse<User>>('/profile/me', input),
    onSuccess: (res) => {
      if (token) setAuth(res.data, token);
      toast.success('Profile updated');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update profile'),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) =>
      api.patch('/profile/me/password', input),
    onSuccess: () => toast.success('Password changed'),
    onError: (err: Error) => toast.error(err.message || 'Failed to change password'),
  });
}
