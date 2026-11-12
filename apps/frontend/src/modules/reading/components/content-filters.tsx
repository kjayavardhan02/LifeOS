import { Search, Heart, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ContentItemFilters, ContentType, ContentStatus } from '@lifeos/shared';

interface ContentFiltersProps {
  filters: ContentItemFilters;
  onChange: (filters: ContentItemFilters) => void;
}

const typeOptions: { value: ContentType; label: string }[] = [
  { value: 'article', label: 'Article' },
  { value: 'book', label: 'Book' },
  { value: 'video', label: 'Video' },
  { value: 'podcast', label: 'Podcast' },
];

const statusOptions: { value: ContentStatus; label: string }[] = [
  { value: 'queued', label: 'Queued' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'dropped', label: 'Dropped' },
];

const selectClass =
  'rounded-md border border-border bg-input px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer';

export function ContentFilters({ filters, onChange }: ContentFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
        <input
          type="text"
          placeholder="Search content..."
          value={filters.search ?? ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
          className="rounded-md border border-border bg-input pl-8 pr-3 py-1.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary w-48"
        />
      </div>

      <div className="flex items-center gap-1.5">
        <Filter className="h-3.5 w-3.5 text-muted" />
        <select
          value={filters.type ?? ''}
          onChange={(e) =>
            onChange({ ...filters, type: (e.target.value as ContentType) || undefined })
          }
          className={selectClass}
        >
          <option value="">All Types</option>
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <select
        value={filters.status ?? ''}
        onChange={(e) =>
          onChange({ ...filters, status: (e.target.value as ContentStatus) || undefined })
        }
        className={selectClass}
      >
        <option value="">All Status</option>
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        onClick={() =>
          onChange({
            ...filters,
            isFavorite: filters.isFavorite ? undefined : true,
          })
        }
        className={cn(
          'flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors',
          filters.isFavorite
            ? 'border-[#E05A52]/30 bg-[#E05A52]/10 text-[#E05A52]'
            : 'border-border text-muted-foreground hover:text-foreground hover:border-border-hover',
        )}
      >
        <Heart className={cn('h-3.5 w-3.5', filters.isFavorite && 'fill-current')} />
        Favorites
      </button>
    </div>
  );
}
