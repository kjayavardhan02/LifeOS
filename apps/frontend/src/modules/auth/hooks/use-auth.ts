import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type { AuthResponse, ApiResponse, SignupInput, LoginInput } from '@lifeos/shared';

export function useSignup() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (input: SignupInput) =>
      api.post<ApiResponse<AuthResponse>>('/auth/signup', input),
    onSuccess: () => {
      toast.success('Account created — please sign in');
      navigate('/login');
    },
    onError: (err: Error) => toast.error(err.message || 'Signup failed'),
  });
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (input: LoginInput) =>
      api.post<ApiResponse<AuthResponse>>('/auth/login', input),
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.token);
      navigate('/');
    },
    onError: (err: Error) => toast.error(err.message || 'Login failed'),
  });
}
