import { Search, X, AlertTriangle, ArrowUpDown } from 'lucide-react';
import type { TaskFilters as TaskFiltersType } from '@lifeos/shared';
import { TASK_STATUSES, PRIORITIES } from '@lifeos/shared';
import { cn } from '@/lib/utils';
import { useCategoryNames } from '@/hooks/use-categories';

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Created' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title' },
  { value: 'updatedAt', label: 'Updated' },
] as const;

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onChange: (filters: TaskFiltersType) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export function TaskFilters({ filters, onChange, sortBy = 'createdAt', sortOrder = 'desc', onSortChange }: TaskFiltersProps) {
  const taskCategories = useCategoryNames('task');
  const set = (patch: Partial<TaskFiltersType>) => onChange({ ...filters, ...patch });

  const hasFilters = filters.status || filters.priority || filters.category || filters.search || filters.isOverdue || filters.dueDateFrom || filters.dueDateTo;

  const selectClass = 'h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search ?? ''}
            onChange={(e) => set({ search: e.target.value || undefined })}
            className="h-9 w-full rounded-md border border-border bg-input pl-9 pr-3 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <select
          value={(filters.status as string) ?? ''}
          onChange={(e) => set({ status: (e.target.value || undefined) as TaskFiltersType['status'] })}
          className={selectClass}
        >
          <option value="">All Statuses</option>
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>

        <select
          value={(filters.priority as string) ?? ''}
          onChange={(e) => set({ priority: (e.target.value || undefined) as TaskFiltersType['priority'] })}
          className={selectClass}
        >
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={filters.category ?? ''}
          onChange={(e) => set({ category: e.target.value || undefined })}
          className={selectClass}
        >
          <option value="">All Categories</option>
          {taskCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <button
          onClick={() => set({ isOverdue: filters.isOverdue ? undefined : true })}
          className={cn(
            'flex items-center gap-1.5 h-9 rounded-md border px-3 text-sm font-medium transition-colors',
            filters.isOverdue
              ? 'border-danger bg-danger/10 text-danger'
              : 'border-border text-muted-foreground hover:text-foreground',
          )}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Overdue
        </button>

        {hasFilters && (
          <button
            onClick={() => onChange({})}
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {onSortChange && (
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value, sortOrder)}
              className="h-8 rounded-md border border-border bg-input px-2 text-xs text-foreground outline-none focus:border-primary"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button
              onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
              className="h-8 rounded-md border border-border px-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>From</span>
          <input
            type="date"
            value={filters.dueDateFrom ? filters.dueDateFrom.slice(0, 10) : ''}
            onChange={(e) => set({ dueDateFrom: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
            className="h-8 rounded-md border border-border bg-input px-2 text-xs text-foreground outline-none focus:border-primary"
          />
          <span>To</span>
          <input
            type="date"
            value={filters.dueDateTo ? filters.dueDateTo.slice(0, 10) : ''}
            onChange={(e) => set({ dueDateTo: e.target.value ? new Date(e.target.value + 'T23:59:59').toISOString() : undefined })}
            className="h-8 rounded-md border border-border bg-input px-2 text-xs text-foreground outline-none focus:border-primary"
          />
        </div>
      </div>
    </div>
  );
}
