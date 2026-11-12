import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FinanceComparison } from '@lifeos/shared';

interface MonthComparisonProps {
  data: FinanceComparison | undefined;
  isLoading: boolean;
}

function formatCurrency(amount: number): string {
  return `₹${Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function DeltaBadge({ value, invertColor }: { value: number; invertColor?: boolean }) {
  const isPositive = value > 0;
  const isZero = value === 0;
  const color = isZero
    ? 'text-muted-foreground bg-card-hover'
    : (isPositive !== invertColor)
      ? 'text-[#2BD47D] bg-[#2BD47D]/10'
      : 'text-[#E05A52] bg-[#E05A52]/10';

  const Icon = isZero ? Minus : isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <span className={cn('inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold', color)}>
      <Icon className="h-3 w-3" />
      {Math.abs(value)}%
    </span>
  );
}

function CompareCard({
  label,
  current,
  previous,
  delta,
  invertColor,
  accent,
  index,
}: {
  label: string;
  current: string;
  previous: string;
  delta: number;
  invertColor?: boolean;
  accent: string;
  index: number;
}) {
  return (
    <div
      className="rounded-xl border border-border bg-card p-5 animate-card-in"
      style={{ '--i': index } as React.CSSProperties}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <DeltaBadge value={delta} invertColor={invertColor} />
      </div>
      <p className={cn('text-2xl font-bold tracking-tight', accent)}>{current}</p>
      <p className="mt-1 text-xs text-muted">
        Previous: <span className="text-muted-foreground">{previous}</span>
      </p>
    </div>
  );
}

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#1A1A19',
    border: '1px solid #2D2A28',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#E5E5E3',
  },
  itemStyle: { color: '#E5E5E3' },
  labelStyle: { color: '#A6A39F' },
};

export function MonthComparison({ data, isLoading }: MonthComparisonProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <TrendingUp className="h-10 w-10 text-muted" />
        <p className="mt-3 text-sm text-muted-foreground">No comparison data available</p>
      </div>
    );
  }

  const { current, previous, deltas, categoryComparison } = data;

  const overviewChartData = [
    {
      name: 'Income',
      [current.label]: current.totalIncome,
      [previous.label]: previous.totalIncome,
    },
    {
      name: 'Expense',
      [current.label]: current.totalExpense,
      [previous.label]: previous.totalExpense,
    },
    {
      name: 'Savings',
      [current.label]: Math.max(current.savings, 0),
      [previous.label]: Math.max(previous.savings, 0),
    },
  ];

  const topCategories = categoryComparison.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Delta stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CompareCard
          label="Income"
          current={formatCurrency(current.totalIncome)}
          previous={formatCurrency(previous.totalIncome)}
          delta={deltas.income}
          accent="text-[#2BD47D]"
          index={0}
        />
        <CompareCard
          label="Expenses"
          current={formatCurrency(current.totalExpense)}
          previous={formatCurrency(previous.totalExpense)}
          delta={deltas.expense}
          invertColor
          accent="text-[#E05A52]"
          index={1}
        />
        <CompareCard
          label="Savings"
          current={formatCurrency(current.savings)}
          previous={formatCurrency(previous.savings)}
          delta={deltas.savings}
          accent="text-[#5B9BF0]"
          index={2}
        />
        <CompareCard
          label="Savings Rate"
          current={`${current.savingsRate}%`}
          previous={`${previous.savingsRate}%`}
          delta={deltas.savingsRate}
          accent={current.savingsRate >= 0 ? 'text-[#2BD47D]' : 'text-[#E05A52]'}
          index={3}
        />
      </div>

      {/* Side-by-side overview chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-1 text-sm font-semibold text-foreground">Month Overview</h3>
        <p className="mb-4 text-xs text-muted">
          {current.label} vs {previous.label}
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={overviewChartData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D2A28" />
              <XAxis dataKey="name" tick={{ fill: '#A6A39F', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#A6A39F', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip {...tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#A6A39F' }} />
              <Bar dataKey={current.label} fill="#5B9BF0" radius={[4, 4, 0, 0]} />
              <Bar dataKey={previous.label} fill="#5B9BF0" fillOpacity={0.3} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category comparison */}
      {topCategories.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-1 text-sm font-semibold text-foreground">Spending by Category</h3>
          <p className="mb-4 text-xs text-muted">
            Expense comparison across top categories
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCategories} layout="vertical" barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2A28" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#A6A39F', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis
                  dataKey="category"
                  type="category"
                  tick={{ fill: '#A6A39F', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                  tickFormatter={(v: string) => v.length > 14 ? v.slice(0, 14) + '…' : v}
                />
                <Tooltip {...tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#A6A39F' }} />
                <Bar dataKey="current" name={current.label} fill="#E05A52" radius={[0, 4, 4, 0]} />
                <Bar dataKey="previous" name={previous.label} fill="#E05A52" fillOpacity={0.3} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Transaction count comparison */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground mb-1">{current.label}</p>
          <p className="text-lg font-bold text-foreground">{current.transactionCount} transactions</p>
          <div className="mt-3 space-y-2">
            {current.categoryBreakdown.slice(0, 5).map((c) => (
              <div key={c.category} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{c.category}</span>
                <span className="font-medium text-foreground">{formatCurrency(c.amount)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground mb-1">{previous.label}</p>
          <p className="text-lg font-bold text-foreground">{previous.transactionCount} transactions</p>
          <div className="mt-3 space-y-2">
            {previous.categoryBreakdown.slice(0, 5).map((c) => (
              <div key={c.category} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{c.category}</span>
                <span className="font-medium text-foreground">{formatCurrency(c.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
