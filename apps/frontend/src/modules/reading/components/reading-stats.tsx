import { BookOpen, CheckCircle2, Clock, Heart } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { StatCard } from '@/components/shared/stat-card';
import type { ReadingStats as ReadingStatsData } from '@lifeos/shared';

interface ReadingStatsProps {
  stats: ReadingStatsData | undefined;
  isLoading: boolean;
}

const typeColors: Record<string, string> = {
  article: '#5B9BF0',
  book: '#E89B6E',
  video: '#E05A52',
  podcast: '#2BD47D',
};

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatMonthLabel(monthStr: string): string {
  const parts = monthStr.split('-');
  const monthIdx = parseInt(parts[1] ?? '1', 10) - 1;
  return `${MONTHS_SHORT[monthIdx]} ${(parts[0] ?? '').slice(2)}`;
}

export function ReadingStatsSection({ stats, isLoading }: ReadingStatsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-72 rounded-xl border border-border bg-card animate-pulse" />
          <div className="h-72 rounded-xl border border-border bg-card animate-pulse" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const chartData = stats.completedPerMonth.map((item) => ({
    month: formatMonthLabel(item.month),
    count: item.count,
  }));

  const pieData = stats.byType
    .filter((t) => t.count > 0)
    .map((t) => ({
      name: t.type.charAt(0).toUpperCase() + t.type.slice(1),
      value: t.count,
      color: typeColors[t.type] ?? '#A6A39F',
    }));

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="animate-card-in" style={{ '--i': 0 } as React.CSSProperties}>
          <StatCard
            label="Total Items"
            value={stats.totalItems}
            icon={BookOpen}
            accent="primary"
          />
        </div>
        <div className="animate-card-in" style={{ '--i': 1 } as React.CSSProperties}>
          <StatCard
            label="Completed This Month"
            value={stats.completedThisMonth}
            icon={CheckCircle2}
            accent="success"
          />
        </div>
        <div className="animate-card-in" style={{ '--i': 2 } as React.CSSProperties}>
          <StatCard
            label="In Progress"
            value={stats.inProgress}
            icon={Clock}
            accent="info"
          />
        </div>
        <div className="animate-card-in" style={{ '--i': 3 } as React.CSSProperties}>
          <StatCard
            label="Favorites"
            value={stats.favorites}
            icon={Heart}
            accent="danger"
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Completed per month bar chart */}
        <div className="rounded-xl border border-border bg-card p-5 animate-card-in" style={{ '--i': 4 } as React.CSSProperties}>
          <h3 className="text-sm font-medium text-foreground mb-1">Completed Per Month</h3>
          <p className="text-xs text-muted-foreground mb-4">Items completed over the last 12 months</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2A28" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#777572', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#2D2A28' }}
                />
                <YAxis
                  tick={{ fill: '#777572', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A19',
                    border: '1px solid #2D2A28',
                    borderRadius: '8px',
                    color: '#E5E5E3',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#5B9BF0" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Type breakdown donut chart */}
        <div className="rounded-xl border border-border bg-card p-5 animate-card-in" style={{ '--i': 5 } as React.CSSProperties}>
          <h3 className="text-sm font-medium text-foreground mb-1">By Content Type</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribution across content types</p>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="h-48 w-48 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1A1A19',
                        border: '1px solid #2D2A28',
                        borderRadius: '8px',
                        color: '#E5E5E3',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 flex-1">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-muted-foreground">{entry.name}</span>
                    </div>
                    <span className="font-medium text-foreground">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
              No content items yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
