import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { AnalyticsCard } from './analytics-card';
import type { AnalyticsGoalStats } from '@lifeos/shared';

const STATUS_COLORS: Record<string, string> = {
  not_started: '#A6A39F',
  in_progress: '#5B9BF0',
  completed: '#2BD47D',
  abandoned: '#E05A52',
};

const TYPE_COLORS: Record<string, string> = {
  short_term: '#F5C344',
  long_term: '#5B9BF0',
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

export function GoalsSection({ stats }: { stats: AnalyticsGoalStats }) {
  const statusData = stats.goalsByStatus.map((s) => ({
    name: s.status.replace('_', ' '),
    value: s.count,
    fill: STATUS_COLORS[s.status] || '#A6A39F',
  }));

  const typeData = stats.goalsByType.map((t) => ({
    name: t.type.replace('_', ' '),
    value: t.count,
    fill: TYPE_COLORS[t.type] || '#A6A39F',
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <MiniStat label="Total Goals" value={stats.totalGoals} />
        <MiniStat label="In Progress" value={stats.inProgressGoals} accent="text-[#5B9BF0]" />
        <MiniStat label="Completed" value={stats.completedGoals} accent="text-[#2BD47D]" />
        <MiniStat label="Avg Progress" value={`${stats.avgProgress}%`} accent="text-[#F5C344]" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsCard title="Goals by Status">
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
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

        <AnalyticsCard title="Goals by Type">
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  dataKey="value"
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {typeData.map((entry, i) => (
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
