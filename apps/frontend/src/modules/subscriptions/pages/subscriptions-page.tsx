import { useState } from 'react';
import { Plus, CreditCard } from 'lucide-react';
import {
  useSubscriptions,
  useSubscription,
  useSubscriptionSummary,
  useCreateSubscription,
  useUpdateSubscription,
} from '../hooks/use-subscriptions';
import { SubscriptionFilters } from '../components/subscription-filters';
import { SubscriptionCard } from '../components/subscription-card';
import { SubscriptionDialog } from '../components/subscription-dialog';
import { SubscriptionDetailPanel } from '../components/subscription-detail-panel';
import { SummaryCards } from '../components/summary-cards';
import type { Subscription, SubscriptionFilters as SubscriptionFiltersType, CreateSubscriptionInput, UpdateSubscriptionInput } from '@lifeos/shared';

export function SubscriptionsPage() {
  const [filters, setFilters] = useState<SubscriptionFiltersType>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useSubscriptions({ ...filters, page, limit: 30 });
  const { data: summaryData, isLoading: summaryLoading } = useSubscriptionSummary();
  const { data: detailData } = useSubscription(selectedSubscription?.id ?? null);
  const createSubscription = useCreateSubscription();
  const updateSubscription = useUpdateSubscription();

  const subscriptions = data?.data ?? [];
  const meta = data?.meta;
  const summary = summaryData?.data;
  const detailSub = detailData?.data;

  const handleSubmit = (input: CreateSubscriptionInput | (UpdateSubscriptionInput & { id: string })) => {
    if ('id' in input) {
      updateSubscription.mutate(input, {
        onSuccess: () => {
          setDialogOpen(false);
          setEditingSubscription(null);
        },
      });
    } else {
      createSubscription.mutate(input, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Subscriptions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your recurring subscriptions and track spending
          </p>
        </div>
        <button
          onClick={() => { setEditingSubscription(null); setDialogOpen(true); }}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Subscription
        </button>
      </div>

      <div className="mb-6">
        <SummaryCards summary={summary} isLoading={summaryLoading} />
      </div>

      <div className="mb-4">
        <SubscriptionFilters filters={filters} onChange={setFilters} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[160px] rounded-lg border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <CreditCard className="h-10 w-10 text-muted" />
          <p className="mt-3 text-sm text-muted-foreground">No subscriptions found</p>
          <p className="mt-1 text-xs text-muted">Add your first subscription to start tracking</p>
          <button
            onClick={() => { setEditingSubscription(null); setDialogOpen(true); }}
            className="mt-4 flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Subscription
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subscriptions.map((subscription, i) => (
              <div key={subscription.id} className="animate-card-in" style={{ '--i': i } as React.CSSProperties}>
                <SubscriptionCard
                  subscription={subscription}
                  onClick={setSelectedSubscription}
                />
              </div>
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <SubscriptionDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingSubscription(null); }}
        onSubmit={handleSubmit}
        subscription={editingSubscription}
      />

      <SubscriptionDetailPanel
        subscription={selectedSubscription}
        transactions={detailSub?.transactions}
        onClose={() => setSelectedSubscription(null)}
      />
    </div>
  );
}
