import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnalyticsCard } from './analytics-card';
import type { AnalyticsHabitStats } from '@lifeos/shared';

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

function getHeatmapColor(count: number): string {
  if (count === 0) return '#1A1A19';
  if (count === 1) return '#2BD47D33';
  if (count <= 3) return '#2BD47D66';
  if (count <= 5) return '#2BD47D99';
  return '#2BD47D';
}

export function HabitsSection({ stats }: { stats: AnalyticsHabitStats }) {
  const performanceData = stats.habitPerformance.slice(0, 8).map((h) => ({
    name: h.name.length > 12 ? h.name.slice(0, 12) + '…' : h.name,
    rate: h.completionRate,
    fill: h.color,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <MiniStat label="Active Habits" value={stats.activeHabits} />
        <MiniStat label="Avg Completion" value={`${stats.avgCompletionRate}%`} accent="text-[#2BD47D]" />
        <MiniStat label="Longest Streak" value={`${stats.longestStreak}d`} accent="text-[#E89B6E]" />
        <MiniStat label="Total Habits" value={stats.totalHabits} accent="text-[#5B9BF0]" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsCard title="Habit Completion Rate" subtitle="Performance by habit">
          {performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={performanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2A28" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fill: '#777572', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: '#777572', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={90}
                />
                <Tooltip {...tooltipStyle} formatter={(value: number) => `${value}%`} />
                <Bar dataKey="rate" radius={[0, 4, 4, 0]} name="Completion">
                  {performanceData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </AnalyticsCard>

        <AnalyticsCard title="Activity Heatmap" subtitle="Last 12 weeks">
          {stats.weeklyHeatmap.length > 0 ? (
            <div className="pt-2">
              <div className="flex flex-wrap gap-1">
                {stats.weeklyHeatmap.map((day) => (
                  <div
                    key={day.date}
                    className="h-3.5 w-3.5 rounded-sm border border-border/50 transition-colors"
                    style={{ backgroundColor: getHeatmapColor(day.count) }}
                    title={`${day.date}: ${day.count} completions`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4 text-[10px] text-muted">
                <span>Less</span>
                {[0, 1, 3, 5, 7].map((count) => (
                  <div
                    key={count}
                    className="h-3 w-3 rounded-sm border border-border/50"
                    style={{ backgroundColor: getHeatmapColor(count) }}
                  />
                ))}
                <span>More</span>
              </div>
            </div>
          ) : (
            <EmptyChart />
          )}
        </AnalyticsCard>

        <AnalyticsCard title="Streak Leaderboard" className="lg:col-span-2">
          {stats.habitPerformance.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {stats.habitPerformance.slice(0, 6).map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 bg-card-hover/30"
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: habit.color + '20', color: habit.color }}
                  >
                    <Flame className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{habit.name}</p>
                    <p className="text-xs text-muted">{habit.totalLogs} completions</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold tabular-nums" style={{ color: habit.color }}>
                      {habit.currentStreak}d
                    </p>
                    <p className="text-[10px] text-muted">best: {habit.longestStreak}d</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyChart />
          )}
        </AnalyticsCard>
      </div>
    </div>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className={`text-xl font-bold tabular-nums ${accent || 'text-foreground'}`}>{value}</p>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
      No data yet
    </div>
  );
}
