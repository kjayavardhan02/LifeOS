import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { LifeContextSnapshot, ApiResponse } from '@lifeos/shared';

export function useLifeContext() {
  return useQuery({
    queryKey: ['life-context'],
    queryFn: () => api.get<ApiResponse<LifeContextSnapshot>>('/life-context'),
    refetchInterval: 60000,
  });
}
