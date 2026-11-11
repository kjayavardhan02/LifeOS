import type { GoalFilters } from '@lifeos/shared';

interface GoalFiltersProps {
  filters: GoalFilters;
  onChange: (filters: GoalFilters) => void;
}

const selectClass = 'h-8 rounded-md border border-border bg-input px-2 text-xs text-foreground outline-none focus:border-primary appearance-none';

export function GoalFiltersBar({ filters, onChange }: GoalFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={filters.status ?? ''}
        onChange={(e) => onChange({ ...filters, status: (e.target.value || undefined) as GoalFilters['status'] })}
        className={selectClass}
      >
        <option value="">All Statuses</option>
        <option value="not_started">Not Started</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="abandoned">Abandoned</option>
      </select>

      <select
        value={filters.type ?? ''}
        onChange={(e) => onChange({ ...filters, type: (e.target.value || undefined) as GoalFilters['type'] })}
        className={selectClass}
      >
        <option value="">All Types</option>
        <option value="short_term">Short Term</option>
        <option value="long_term">Long Term</option>
      </select>

      <select
        value={filters.priority ?? ''}
        onChange={(e) => onChange({ ...filters, priority: (e.target.value || undefined) as GoalFilters['priority'] })}
        className={selectClass}
      >
        <option value="">All Priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>

      <select
        value={filters.category ?? ''}
        onChange={(e) => onChange({ ...filters, category: e.target.value || undefined })}
        className={selectClass}
      >
        <option value="">All Categories</option>
        <option value="Personal">Personal</option>
        <option value="Career">Career</option>
        <option value="Health">Health</option>
        <option value="Finance">Finance</option>
        <option value="Learning">Learning</option>
        <option value="Relationships">Relationships</option>
        <option value="Creative">Creative</option>
        <option value="Other">Other</option>
      </select>

      {(filters.status || filters.type || filters.priority || filters.category) && (
        <button
          onClick={() => onChange({})}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
