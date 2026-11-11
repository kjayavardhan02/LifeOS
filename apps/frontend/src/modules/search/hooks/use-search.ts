import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse, SearchResults, SearchModule } from '@lifeos/shared';

interface UseSearchOptions {
  module?: SearchModule;
  sortBy?: 'relevance' | 'date';
  limit?: number;
}

const SEARCH_KEY = ['search'];

function buildSearchParams(query: string, options?: UseSearchOptions): string {
  const params = new URLSearchParams();
  params.set('q', query);
  if (options?.module) params.set('module', options.module);
  if (options?.sortBy) params.set('sortBy', options.sortBy);
  if (options?.limit) params.set('limit', String(options.limit));
  return params.toString();
}

export function useSearch(query: string, options?: UseSearchOptions) {
  return useQuery({
    queryKey: [...SEARCH_KEY, query, options],
    queryFn: () =>
      api.get<ApiResponse<SearchResults>>(
        `/search?${buildSearchParams(query, options)}`,
      ),
    enabled: query.length >= 2,
    staleTime: 30_000,
  });
}
