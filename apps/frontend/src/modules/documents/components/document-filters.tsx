import { Search, X } from 'lucide-react';
import { useCategoryNames } from '@/hooks/use-categories';
import type { DocumentFilters as DocumentFiltersType } from '@lifeos/shared';

interface DocumentFiltersProps {
  filters: DocumentFiltersType;
  onChange: (filters: DocumentFiltersType) => void;
}

const EXPIRY_OPTIONS = [
  { value: 'all', label: 'All Documents' },
  { value: 'expiring_soon', label: 'Expiring Soon' },
  { value: 'expired', label: 'Expired' },
] as const;

const STORAGE_OPTIONS = [
  { value: '', label: 'All Storage' },
  { value: 'local', label: 'Local Files' },
  { value: 'external', label: 'External Links' },
] as const;

const inputClass =
  'rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary';

export function DocumentFilters({ filters, onChange }: DocumentFiltersProps) {
  const documentCategories = useCategoryNames('document');

  const hasFilters = filters.search || filters.category || filters.storageType || filters.expiryStatus;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-lg">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={filters.search ?? ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
          placeholder="Search documents..."
          className={inputClass + ' w-full pl-9'}
        />
      </div>

      <select
        value={filters.category ?? ''}
        onChange={(e) => onChange({ ...filters, category: e.target.value || undefined })}
        className={inputClass + ' w-auto min-w-[140px]'}
      >
        <option value="">All Categories</option>
        {documentCategories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={filters.storageType ?? ''}
        onChange={(e) =>
          onChange({
            ...filters,
            storageType: (e.target.value || undefined) as DocumentFiltersType['storageType'],
          })
        }
        className={inputClass + ' w-auto min-w-[130px]'}
      >
        {STORAGE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={filters.expiryStatus ?? 'all'}
        onChange={(e) =>
          onChange({
            ...filters,
            expiryStatus: (e.target.value === 'all' ? undefined : e.target.value) as DocumentFiltersType['expiryStatus'],
          })
        }
        className={inputClass + ' w-auto min-w-[140px]'}
      >
        {EXPIRY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={() => onChange({})}
          className="flex items-center gap-1 rounded-md px-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}
