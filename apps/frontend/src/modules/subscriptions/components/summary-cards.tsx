import { IndianRupee, CreditCard, CalendarClock, RotateCw } from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';
import type { SubscriptionSummary } from '@lifeos/shared';

interface SummaryCardsProps {
  summary: SubscriptionSummary | undefined;
  isLoading: boolean;
}

function formatCurrency(value: number): string {
  return '₹' + value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[120px] rounded-lg border border-border bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  const upcomingCount = summary?.upcomingRenewals?.filter((s) => {
    const renewalDate = new Date(s.nextRenewalDate);
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return renewalDate <= sevenDaysFromNow;
  }).length ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Monthly Cost"
        value={formatCurrency(summary?.totalMonthly ?? 0)}
        subtitle="Active subscriptions"
        icon={IndianRupee}
      />
      <StatCard
        label="Total Yearly Cost"
        value={formatCurrency(summary?.totalYearly ?? 0)}
        subtitle="Projected annual spend"
        icon={CreditCard}
      />
      <StatCard
        label="Active Subscriptions"
        value={summary?.activeCount ?? 0}
        subtitle="Currently active"
        icon={RotateCw}
      />
      <StatCard
        label="Upcoming Renewals"
        value={upcomingCount}
        subtitle="Within next 7 days"
        icon={CalendarClock}
      />
    </div>
  );
}
