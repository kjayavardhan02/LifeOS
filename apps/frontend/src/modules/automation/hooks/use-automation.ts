import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

interface AutomationAction {
  id: string;
  ruleId: string;
  actionType: string;
  config: Record<string, unknown>;
  sortOrder: number;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  triggerType: 'event' | 'schedule' | 'threshold';
  triggerConfig: Record<string, unknown>;
  conditions: Array<Record<string, unknown>> | null;
  actions: AutomationAction[];
  lastTriggeredAt: string | null;
  triggerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationLog {
  id: string;
  ruleId: string;
  ruleName: string;
  trigger: Record<string, unknown>;
  actions: unknown[];
  status: string;
  error: string | null;
  createdAt: string;
}

interface CreateRuleInput {
  name: string;
  description?: string;
  isActive?: boolean;
  triggerType: 'event' | 'schedule' | 'threshold';
  triggerConfig: Record<string, unknown>;
  conditions?: Array<Record<string, unknown>>;
  actions: Array<{ actionType: string; config: Record<string, unknown>; sortOrder?: number }>;
}

type UpdateRuleInput = Partial<CreateRuleInput>;

const RULES_KEY = ['automation-rules'];
const LOGS_KEY = ['automation-logs'];

export function useAutomationRules() {
  return useQuery({
    queryKey: RULES_KEY,
    queryFn: () => api.get<{ data: AutomationRule[] }>('/automation/rules'),
  });
}

export function useAutomationLogs(ruleId?: string) {
  return useQuery({
    queryKey: [...LOGS_KEY, ruleId],
    queryFn: () => api.get<{ data: AutomationLog[]; meta: { total: number } }>(
      `/automation/logs${ruleId ? `?ruleId=${ruleId}` : ''}`,
    ),
  });
}

export function useCreateRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRuleInput) =>
      api.post<{ data: AutomationRule }>('/automation/rules', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RULES_KEY });
      toast.success('Automation rule created');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create rule'),
  });
}

export function useUpdateRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateRuleInput & { id: string }) =>
      api.patch<{ data: AutomationRule }>(`/automation/rules/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RULES_KEY });
      toast.success('Automation rule updated');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update rule'),
  });
}

export function useDeleteRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/automation/rules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RULES_KEY });
      toast.success('Automation rule deleted');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete rule'),
  });
}

export function useToggleRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch<{ data: AutomationRule }>(`/automation/rules/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RULES_KEY });
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to toggle rule'),
  });
}
