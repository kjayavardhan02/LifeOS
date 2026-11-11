import { Search, X } from 'lucide-react';
import { SUBSCRIPTION_STATUSES, BILLING_CYCLES } from '@lifeos/shared';
import type { SubscriptionFilters as SubscriptionFiltersType, BillingCycle } from '@lifeos/shared';
import { useCategoryNames } from '@/hooks/use-categories';

const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

interface SubscriptionFiltersProps {
  filters: SubscriptionFiltersType;
  onChange: (filters: SubscriptionFiltersType) => void;
}

export function SubscriptionFilters({ filters, onChange }: SubscriptionFiltersProps) {
  const subscriptionCategories = useCategoryNames('subscription');
  const set = (patch: Partial<SubscriptionFiltersType>) => onChange({ ...filters, ...patch });

  const hasFilters = filters.status || filters.category || filters.search || filters.billingCycle;

  const selectClass = 'h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search subscriptions..."
          value={filters.search ?? ''}
          onChange={(e) => set({ search: e.target.value || undefined })}
          className="h-9 w-full rounded-md border border-border bg-input pl-9 pr-3 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <select
        value={filters.status ?? ''}
        onChange={(e) => set({ status: (e.target.value || undefined) as SubscriptionFiltersType['status'] })}
        className={selectClass}
      >
        <option value="">All Statuses</option>
        {SUBSCRIPTION_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>

      <select
        value={filters.category ?? ''}
        onChange={(e) => set({ category: e.target.value || undefined })}
        className={selectClass}
      >
        <option value="">All Categories</option>
        {subscriptionCategories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={filters.billingCycle ?? ''}
        onChange={(e) => set({ billingCycle: (e.target.value || undefined) as SubscriptionFiltersType['billingCycle'] })}
        className={selectClass}
      >
        <option value="">All Cycles</option>
        {BILLING_CYCLES.map((c) => (
          <option key={c} value={c}>{BILLING_CYCLE_LABELS[c]}</option>
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
