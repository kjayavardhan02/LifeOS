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
          <div key={i} className="h-28 rounded-xl border border-border bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Income',
      value: formatCurrency(summary?.totalIncome ?? 0),
      icon: TrendingUp,
      colorClass: 'text-[#2BD47D]',
      bgClass: 'bg-[#2BD47D]/10',
      borderClass: 'border-[#2BD47D]/20 hover:border-[#2BD47D]/40',
      glowClass: 'hover:shadow-[0_0_24px_rgba(43,212,125,0.12)]',
    },
    {
      label: 'Total Expense',
      value: formatCurrency(summary?.totalExpense ?? 0),
      icon: TrendingDown,
      colorClass: 'text-[#E05A52]',
      bgClass: 'bg-[#E05A52]/10',
      borderClass: 'border-[#E05A52]/20 hover:border-[#E05A52]/40',
      glowClass: 'hover:shadow-[0_0_24px_rgba(224,90,82,0.12)]',
    },
    {
      label: 'Net Savings',
      value: formatCurrency(summary?.savings ?? 0),
      icon: PiggyBank,
      colorClass: 'text-[#5B9BF0]',
      bgClass: 'bg-[#5B9BF0]/10',
      borderClass: 'border-[#5B9BF0]/20 hover:border-[#5B9BF0]/40',
      glowClass: 'hover:shadow-[0_0_24px_rgba(91,155,240,0.12)]',
    },
    {
      label: 'Savings Rate',
      value: `${(summary?.savingsRate ?? 0).toFixed(1)}%`,
      icon: Percent,
      colorClass: (summary?.savingsRate ?? 0) >= 0 ? 'text-[#2BD47D]' : 'text-[#E05A52]',
      bgClass: (summary?.savingsRate ?? 0) >= 0 ? 'bg-[#2BD47D]/10' : 'bg-[#E05A52]/10',
      borderClass: (summary?.savingsRate ?? 0) >= 0 ? 'border-[#2BD47D]/20 hover:border-[#2BD47D]/40' : 'border-[#E05A52]/20 hover:border-[#E05A52]/40',
      glowClass: (summary?.savingsRate ?? 0) >= 0 ? 'hover:shadow-[0_0_24px_rgba(43,212,125,0.12)]' : 'hover:shadow-[0_0_24px_rgba(224,90,82,0.12)]',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`group rounded-xl border bg-card p-5 card-interactive overflow-hidden ${card.borderClass} ${card.glowClass}`}
        >
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
            <div className={`rounded-lg p-2 ${card.bgClass}`}>
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
