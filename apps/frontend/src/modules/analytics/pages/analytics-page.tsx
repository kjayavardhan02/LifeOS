import { useState } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useProductivityStats,
  useFinanceStats,
  useHabitStats,
  useGoalStats,
} from '../hooks/use-analytics';
import { ProductivitySection } from '../components/productivity-section';
import { FinanceSection } from '../components/finance-section';
import { HabitsSection } from '../components/habits-section';
import { GoalsSection } from '../components/goals-section';

type Tab = 'productivity' | 'finance' | 'habits' | 'goals';
type Period = 'week' | 'month' | 'quarter' | 'year';

const TABS: { key: Tab; label: string }[] = [
  { key: 'productivity', label: 'Productivity' },
  { key: 'finance', label: 'Finance' },
  { key: 'habits', label: 'Habits' },
  { key: 'goals', label: 'Goals' },
];

const PERIODS: { key: Period; label: string }[] = [
  { key: 'week', label: '7D' },
  { key: 'month', label: '30D' },
  { key: 'quarter', label: '90D' },
  { key: 'year', label: '1Y' },
];

export function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>('productivity');
  const [period, setPeriod] = useState<Period>('month');

  const { data: prodData, isLoading: prodLoading } = useProductivityStats(period);
  const { data: finData, isLoading: finLoading } = useFinanceStats(period);
  const { data: habitData, isLoading: habitLoading } = useHabitStats(period);
  const { data: goalData, isLoading: goalLoading } = useGoalStats(period);

  const isLoading =
    (tab === 'productivity' && prodLoading) ||
    (tab === 'finance' && finLoading) ||
    (tab === 'habits' && habitLoading) ||
    (tab === 'goals' && goalLoading);

  return (
    <div className="animate-page-in">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#5B9BF0] to-[#3D6FBF] shadow-[0_2px_12px_rgba(91,155,240,0.3)]">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Analytics</h1>
            <p className="text-sm text-muted">Insights across your life data</p>
          </div>
        </div>

        <div className="flex items-center rounded-xl bg-card border border-border p-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                period === p.key
                  ? 'bg-[#5B9BF0] text-white shadow-[0_2px_8px_rgba(91,155,240,0.3)]'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 flex items-center gap-1 rounded-xl bg-card border border-border p-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-all whitespace-nowrap',
              tab === t.key
                ? 'bg-[#5B9BF0] text-white shadow-[0_2px_8px_rgba(91,155,240,0.3)]'
                : 'text-muted-foreground hover:text-foreground hover:bg-card-hover',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {tab === 'productivity' && prodData?.data && (
            <ProductivitySection stats={prodData.data} />
          )}
          {tab === 'finance' && finData?.data && (
            <FinanceSection stats={finData.data} />
          )}
          {tab === 'habits' && habitData?.data && (
            <HabitsSection stats={habitData.data} />
          )}
          {tab === 'goals' && goalData?.data && (
            <GoalsSection stats={goalData.data} />
          )}
        </>
      )}
    </div>
  );
}
