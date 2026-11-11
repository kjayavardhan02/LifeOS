import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type {
  Project,
  ProjectStats,
  Milestone,
  CreateProjectInput,
  UpdateProjectInput,
  CreateMilestoneInput,
  UpdateMilestoneInput,
  ProjectFilters,
  PaginatedResponse,
  PaginationParams,
  ApiResponse,
} from '@lifeos/shared';

type ProjectQueryParams = ProjectFilters & PaginationParams;

interface ProjectListItem extends Omit<Project, 'milestones' | 'tasks'> {
  taskStats: { totalTasks: number; completedTasks: number };
}

const PROJECTS_KEY = ['projects'];

function buildQueryString(params: ProjectQueryParams): string {
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

export function useProjects(params: ProjectQueryParams = {}) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, params],
    queryFn: () => api.get<PaginatedResponse<ProjectListItem>>(`/projects${buildQueryString(params)}`),
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, id],
    queryFn: () => api.get<ApiResponse<Project>>(`/projects/${id}`),
    enabled: !!id,
  });
}

export function useProjectStats(id: string | undefined) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, id, 'stats'],
    queryFn: () => api.get<ApiResponse<ProjectStats>>(`/projects/${id}/stats`),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) =>
      api.post<ApiResponse<Project>>('/projects', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
      toast.success('Project created');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create project'),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateProjectInput & { id: string }) =>
      api.patch<ApiResponse<Project>>(`/projects/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
      toast.success('Project updated');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update project'),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
      toast.success('Project deleted');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete project'),
  });
}

export function useAddMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, ...input }: CreateMilestoneInput & { projectId: string }) =>
      api.post<ApiResponse<Milestone>>(`/projects/${projectId}/milestones`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
      toast.success('Milestone added');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to add milestone'),
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      milestoneId,
      ...input
    }: UpdateMilestoneInput & { projectId: string; milestoneId: string }) =>
      api.patch<ApiResponse<Milestone>>(`/projects/${projectId}/milestones/${milestoneId}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
      toast.success('Milestone updated');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update milestone'),
  });
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, milestoneId }: { projectId: string; milestoneId: string }) =>
      api.delete(`/projects/${projectId}/milestones/${milestoneId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
      toast.success('Milestone deleted');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete milestone'),
  });
}

export function useLinkTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, taskId }: { projectId: string; taskId: string }) =>
      api.post<ApiResponse<unknown>>(`/projects/${projectId}/tasks/${taskId}/link`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task linked to project');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to link task'),
  });
}

export function useUnlinkTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, taskId }: { projectId: string; taskId: string }) =>
      api.delete(`/projects/${projectId}/tasks/${taskId}/link`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task unlinked from project');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to unlink task'),
  });
}

export type { ProjectListItem };
