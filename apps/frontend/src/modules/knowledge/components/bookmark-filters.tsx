import { Search, X } from 'lucide-react';
import type { BookmarkFilters as BookmarkFiltersType } from '@lifeos/shared';
import { cn } from '@/lib/utils';

interface BookmarkFiltersProps {
  filters: BookmarkFiltersType;
  onChange: (filters: BookmarkFiltersType) => void;
}

export function BookmarkFilters({ filters, onChange }: BookmarkFiltersProps) {
  const set = (patch: Partial<BookmarkFiltersType>) => onChange({ ...filters, ...patch });

  const hasFilters = filters.search || filters.isPinned || filters.isArchived;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search bookmarks..."
          value={filters.search ?? ''}
          onChange={(e) => set({ search: e.target.value || undefined })}
          className="h-9 w-full rounded-md border border-border bg-input pl-9 pr-3 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <button
        onClick={() => set({ isPinned: filters.isPinned ? undefined : true })}
        className={cn(
          'flex items-center gap-1.5 h-9 rounded-md border px-3 text-sm font-medium transition-colors',
          filters.isPinned
            ? 'border-warning bg-warning/10 text-warning'
            : 'border-border text-muted-foreground hover:text-foreground',
        )}
      >
        Pinned
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
