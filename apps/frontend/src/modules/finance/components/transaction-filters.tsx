import { Search, X } from 'lucide-react';
import { PAYMENT_METHODS, TRANSACTION_TYPES } from '@lifeos/shared';
import type { TransactionFilters as TransactionFiltersType } from '@lifeos/shared';
import { useCategoryNames } from '@/hooks/use-categories';

interface TransactionFiltersProps {
  filters: TransactionFiltersType;
  onChange: (filters: TransactionFiltersType) => void;
}

export function TransactionFilters({ filters, onChange }: TransactionFiltersProps) {
  const expenseCategories = useCategoryNames('expense');
  const incomeCategories = useCategoryNames('income');
  const allCategories = [...new Set([...expenseCategories, ...incomeCategories])];

  const set = (patch: Partial<TransactionFiltersType>) => onChange({ ...filters, ...patch });

  const hasFilters =
    filters.type ||
    filters.category ||
    filters.paymentMethod ||
    filters.search ||
    filters.dateFrom ||
    filters.dateTo;

  const selectClass =
    'h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search transactions..."
          value={filters.search ?? ''}
          onChange={(e) => set({ search: e.target.value || undefined })}
          className="h-9 w-full rounded-md border border-border bg-input pl-9 pr-3 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <select
        value={filters.type ?? ''}
        onChange={(e) =>
          set({ type: (e.target.value || undefined) as TransactionFiltersType['type'] })
        }
        className={selectClass}
      >
        <option value="">All Types</option>
        {TRANSACTION_TYPES.map((t) => (
          <option key={t} value={t}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </option>
        ))}
      </select>

      <select
        value={filters.category ?? ''}
        onChange={(e) => set({ category: e.target.value || undefined })}
        className={selectClass}
      >
        <option value="">All Categories</option>
        {allCategories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={filters.paymentMethod ?? ''}
        onChange={(e) => set({ paymentMethod: e.target.value || undefined })}
        className={selectClass}
      >
        <option value="">All Methods</option>
        {PAYMENT_METHODS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={filters.dateFrom ? filters.dateFrom.slice(0, 10) : ''}
        onChange={(e) =>
          set({
            dateFrom: e.target.value
              ? new Date(e.target.value).toISOString()
              : undefined,
          })
        }
        className={`${selectClass} w-36`}
        title="From date"
      />

      <input
        type="date"
        value={filters.dateTo ? filters.dateTo.slice(0, 10) : ''}
        onChange={(e) =>
          set({
            dateTo: e.target.value
              ? new Date(e.target.value + 'T23:59:59.999Z').toISOString()
              : undefined,
          })
        }
        className={`${selectClass} w-36`}
        title="To date"
      />

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
