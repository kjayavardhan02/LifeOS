import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { AnalyticsCard } from './analytics-card';
import type { ProductivityStats } from '@lifeos/shared';

const COLORS = ['#5B9BF0', '#2BD47D', '#F5C344', '#E05A52', '#E89B6E', '#A6A39F'];

const STATUS_COLORS: Record<string, string> = {
  todo: '#A6A39F',
  in_progress: '#5B9BF0',
  done: '#2BD47D',
  cancelled: '#E05A52',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: '#A6A39F',
  medium: '#5B9BF0',
  high: '#F5C344',
  urgent: '#E05A52',
};

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

export function ProductivitySection({ stats }: { stats: ProductivityStats }) {
  const statusData = stats.tasksByStatus.map((s) => ({
    name: s.status.replace('_', ' '),
    value: s.count,
    fill: STATUS_COLORS[s.status] || COLORS[0],
  }));

  const priorityData = stats.tasksByPriority.map((p) => ({
    name: p.priority,
    value: p.count,
    fill: PRIORITY_COLORS[p.priority] || COLORS[0],
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <MiniStat label="Total Tasks" value={stats.totalTasks} />
        <MiniStat label="Completed" value={stats.completedTasks} accent="text-[#2BD47D]" />
        <MiniStat label="Completion Rate" value={`${stats.completionRate}%`} accent="text-[#5B9BF0]" />
        <MiniStat
          label="Avg Completion"
          value={stats.avgCompletionDays !== null ? `${stats.avgCompletionDays}d` : '—'}
          accent="text-[#E89B6E]"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsCard title="Task Completion Trend" subtitle="Created vs completed over time">
          {stats.completionTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={stats.completionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2A28" />
                <XAxis dataKey="date" tick={{ fill: '#777572', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#777572', fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="created" stroke="#5B9BF0" strokeWidth={2} dot={false} name="Created" />
                <Line type="monotone" dataKey="completed" stroke="#2BD47D" strokeWidth={2} dot={false} name="Completed" />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#A6A39F' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </AnalyticsCard>

        <AnalyticsCard title="Tasks by Status">
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend
                  wrapperStyle={{ fontSize: '11px' }}
                  formatter={(value: string) => <span className="text-muted-foreground capitalize">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </AnalyticsCard>

        <AnalyticsCard title="Tasks by Priority">
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={priorityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2A28" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#777572', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: '#777572', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={60}
                />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Tasks">
                  {priorityData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </AnalyticsCard>

        <AnalyticsCard title="Top Categories">
          {stats.tasksByCategory.length > 0 ? (
            <div className="space-y-3 pt-1">
              {stats.tasksByCategory.slice(0, 6).map((cat, i) => {
                const max = stats.tasksByCategory[0].count;
                const pct = max > 0 ? (cat.count / max) * 100 : 0;
                return (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-foreground">{cat.category}</span>
                      <span className="text-muted tabular-nums">{cat.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-card-hover overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
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
    <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm">
      No data yet
    </div>
  );
}
