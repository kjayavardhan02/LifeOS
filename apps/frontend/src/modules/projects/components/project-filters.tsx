import { Search, X } from 'lucide-react';
import { PROJECT_STATUSES, PRIORITIES } from '@lifeos/shared';
import type { ProjectFilters as ProjectFiltersType, ProjectStatus, Priority } from '@lifeos/shared';
import { useCategoryNames } from '@/hooks/use-categories';

const STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: 'Planning',
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
  archived: 'Archived',
};

const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Critical',
};

interface ProjectFiltersProps {
  filters: ProjectFiltersType;
  onChange: (filters: ProjectFiltersType) => void;
}

export function ProjectFilters({ filters, onChange }: ProjectFiltersProps) {
  const projectCategories = useCategoryNames('project');
  const set = (patch: Partial<ProjectFiltersType>) => onChange({ ...filters, ...patch });

  const hasFilters = filters.status || filters.priority || filters.category || filters.search;

  const selectClass =
    'h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[200px] max-w-sm flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search projects..."
          value={filters.search ?? ''}
          onChange={(e) => set({ search: e.target.value || undefined })}
          className="h-9 w-full rounded-md border border-border bg-input pl-9 pr-3 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <select
        value={filters.status ?? ''}
        onChange={(e) =>
          set({ status: (e.target.value || undefined) as ProjectFiltersType['status'] })
        }
        className={selectClass}
      >
        <option value="">All Statuses</option>
        {PROJECT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      <select
        value={filters.priority ?? ''}
        onChange={(e) =>
          set({ priority: (e.target.value || undefined) as ProjectFiltersType['priority'] })
        }
        className={selectClass}
      >
        <option value="">All Priorities</option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {PRIORITY_LABELS[p]}
          </option>
        ))}
      </select>

      <select
        value={filters.category ?? ''}
        onChange={(e) => set({ category: e.target.value || undefined })}
        className={selectClass}
      >
        <option value="">All Categories</option>
        {projectCategories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

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
  );
}
