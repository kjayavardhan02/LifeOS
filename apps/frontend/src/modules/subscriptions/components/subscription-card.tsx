import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Subscription, SubscriptionStatus } from '@lifeos/shared';

interface SubscriptionCardProps {
  subscription: Subscription;
  onClick: (subscription: Subscription) => void;
}

const statusConfig: Record<SubscriptionStatus, { text: string; color: string; borderColor: string }> = {
  active: { text: 'Active', color: 'bg-success/15 text-success', borderColor: 'border-l-success' },
  paused: { text: 'Paused', color: 'bg-warning/15 text-warning', borderColor: 'border-l-warning' },
  cancelled: { text: 'Cancelled', color: 'bg-danger/15 text-danger', borderColor: 'border-l-danger' },
  trial: { text: 'Trial', color: 'bg-primary/15 text-primary', borderColor: 'border-l-primary' },
  expired: { text: 'Expired', color: 'bg-card-hover text-muted-foreground', borderColor: 'border-l-muted' },
};

const BILLING_CYCLE_SHORT: Record<string, string> = {
  monthly: '/mo',
  quarterly: '/qtr',
  yearly: '/yr',
};

function formatCurrency(value: number): string {
  return value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function SubscriptionCard({ subscription, onClick }: SubscriptionCardProps) {
  const config = statusConfig[subscription.status];

  return (
    <button
      onClick={() => onClick(subscription)}
      className={cn(
        'w-full text-left rounded-lg border border-border border-l-[3px] bg-card p-4 transition-colors hover:bg-card-hover',
        config.borderColor,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-foreground truncate">{subscription.name}</h3>
          {subscription.provider && (
            <p className="mt-0.5 text-xs text-muted-foreground truncate">{subscription.provider}</p>
          )}
        </div>
        <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-xs font-medium', config.color)}>
          {config.text}
        </span>
      </div>

      <div className="mt-3">
        <span className="text-lg font-bold text-foreground">
          {'₹'}{formatCurrency(subscription.amount)}
        </span>
        <span className="text-sm text-muted-foreground">{BILLING_CYCLE_SHORT[subscription.billingCycle]}</span>
        {subscription.billingCycle !== 'monthly' && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {'₹'}{formatCurrency(subscription.monthlyEquivalent)}/mo equivalent
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>Next: {format(new Date(subscription.nextRenewalDate), 'MMM d, yyyy')}</span>
        <span className="rounded bg-card-hover px-1.5 py-0.5">{subscription.category}</span>
      </div>

      {subscription.paymentMethod && (
        <div className="mt-1.5 text-xs text-muted">
          {subscription.paymentMethod}
        </div>
      )}
    </button>
  );
}
