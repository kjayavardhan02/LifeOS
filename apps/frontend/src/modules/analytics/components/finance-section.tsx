import {
  AreaChart,
  Area,
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
  Legend,
} from 'recharts';
import { AnalyticsCard } from './analytics-card';
import type { FinanceStats } from '@lifeos/shared';

const COLORS = ['#5B9BF0', '#2BD47D', '#F5C344', '#E05A52', '#E89B6E', '#A6A39F', '#9B8AFF', '#FF8A9B'];

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

function formatCurrency(val: number): string {
  return `₹${val.toLocaleString('en-IN')}`;
}

export function FinanceSection({ stats }: { stats: FinanceStats }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <MiniStat label="Income" value={formatCurrency(stats.totalIncome)} accent="text-[#2BD47D]" />
        <MiniStat label="Expenses" value={formatCurrency(stats.totalExpense)} accent="text-[#E05A52]" />
        <MiniStat
          label="Net Savings"
          value={formatCurrency(stats.netSavings)}
          accent={stats.netSavings >= 0 ? 'text-[#2BD47D]' : 'text-[#E05A52]'}
        />
        <MiniStat label="Savings Rate" value={`${stats.savingsRate}%`} accent="text-[#5B9BF0]" />
        <MiniStat label="Subscriptions/mo" value={formatCurrency(stats.totalSubscriptionCost)} accent="text-[#E89B6E]" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsCard title="Monthly Trend" subtitle="Income vs expenses over 6 months">
          {stats.monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2A28" />
                <XAxis dataKey="month" tick={{ fill: '#777572', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#777572', fontSize: 11 }} tickLine={false} axisLine={false} width={50} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip {...tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="income" fill="#2BD47D" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#E05A52" radius={[4, 4, 0, 0]} name="Expense" />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#A6A39F' }} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </AnalyticsCard>

        <AnalyticsCard title="Daily Spending" subtitle="Spending pattern this period">
          {stats.dailySpending.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={stats.dailySpending}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E05A52" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E05A52" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2A28" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#777572', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis tick={{ fill: '#777572', fontSize: 11 }} tickLine={false} axisLine={false} width={50} tickFormatter={(v) => `₹${v}`} />
                <Tooltip {...tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                <Area type="monotone" dataKey="amount" stroke="#E05A52" fill="url(#spendGradient)" strokeWidth={2} name="Spent" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </AnalyticsCard>

        <AnalyticsCard title="Expense Breakdown" subtitle="By category">
          {stats.expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={stats.expenseByCategory.slice(0, 8)}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  dataKey="amount"
                  nameKey="category"
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {stats.expenseByCategory.slice(0, 8).map((_entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                <Legend
                  wrapperStyle={{ fontSize: '10px' }}
                  formatter={(value: string) => <span className="text-muted-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </AnalyticsCard>

        <AnalyticsCard title="Top Expense Categories">
          {stats.expenseByCategory.length > 0 ? (
            <div className="space-y-3 pt-1">
              {stats.expenseByCategory.slice(0, 8).map((cat, i) => {
                const max = stats.expenseByCategory[0].amount;
                const pct = max > 0 ? (cat.amount / max) * 100 : 0;
                return (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-foreground">{cat.category}</span>
                      <span className="text-muted tabular-nums">{formatCurrency(cat.amount)}</span>
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
    <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
      No data yet
    </div>
  );
}
