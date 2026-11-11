import { Search, X, AlertTriangle } from 'lucide-react';
import { REMINDER_STATUSES, PRIORITIES } from '@lifeos/shared';
import { cn } from '@/lib/utils';
import type { ReminderFilters as ReminderFiltersType } from '@lifeos/shared';
import { useCategoryNames } from '@/hooks/use-categories';

interface ReminderFiltersProps {
  filters: ReminderFiltersType;
  onChange: (filters: ReminderFiltersType) => void;
}

export function ReminderFilters({ filters, onChange }: ReminderFiltersProps) {
  const reminderCategories = useCategoryNames('reminder');
  const set = (patch: Partial<ReminderFiltersType>) => onChange({ ...filters, ...patch });

  const hasFilters = filters.status || filters.priority || filters.category || filters.search || filters.isOverdue;

  const selectClass = 'h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search reminders..."
          value={filters.search ?? ''}
          onChange={(e) => set({ search: e.target.value || undefined })}
          className="h-9 w-full rounded-md border border-border bg-input pl-9 pr-3 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <select
        value={(filters.status as string) ?? ''}
        onChange={(e) => set({ status: (e.target.value || undefined) as ReminderFiltersType['status'] })}
        className={selectClass}
      >
        <option value="">All Statuses</option>
        {REMINDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>

      <select
        value={(filters.priority as string) ?? ''}
        onChange={(e) => set({ priority: (e.target.value || undefined) as ReminderFiltersType['priority'] })}
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
        {reminderCategories.map((c) => (
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
  );
}
