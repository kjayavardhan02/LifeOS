import { TrendingUp, TrendingDown, PiggyBank, Percent } from 'lucide-react';
import type { FinanceSummary } from '@lifeos/shared';

interface SummaryCardsProps {
  summary: FinanceSummary | undefined;
  isLoading: boolean;
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-lg border border-border bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Income',
      value: formatCurrency(summary?.totalIncome ?? 0),
      icon: TrendingUp,
      colorClass: 'text-success',
      bgClass: 'bg-success/10',
    },
    {
      label: 'Total Expense',
      value: formatCurrency(summary?.totalExpense ?? 0),
      icon: TrendingDown,
      colorClass: 'text-danger',
      bgClass: 'bg-danger/10',
    },
    {
      label: 'Net Savings',
      value: formatCurrency(summary?.savings ?? 0),
      icon: PiggyBank,
      colorClass: 'text-primary',
      bgClass: 'bg-primary/10',
    },
    {
      label: 'Savings Rate',
      value: `${(summary?.savingsRate ?? 0).toFixed(1)}%`,
      icon: Percent,
      colorClass: (summary?.savingsRate ?? 0) >= 0 ? 'text-success' : 'text-danger',
      bgClass: (summary?.savingsRate ?? 0) >= 0 ? 'bg-success/10' : 'bg-danger/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-border-hover"
        >
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
            <div className={`rounded-md p-1.5 ${card.bgClass}`}>
              <card.icon className={`h-4 w-4 ${card.colorClass}`} />
            </div>
          </div>
          <p className={`mt-3 text-3xl font-bold tracking-tight ${card.colorClass}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
