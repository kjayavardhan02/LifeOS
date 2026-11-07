import {
  CheckSquare,
  Calendar,
  Bell,
  Wallet,
  FolderKanban,
  TrendingUp,
} from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';

export function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your life at a glance — updated just now
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <StatCard label="Open Tasks" value={0} subtitle="0 due today" icon={CheckSquare} />
        <StatCard label="Today's Events" value={0} subtitle="No events" icon={Calendar} />
        <StatCard label="Active Reminders" value={0} subtitle="None pending" icon={Bell} />
        <StatCard label="This Month" value="₹0" subtitle="Spent so far" icon={Wallet} />
        <StatCard label="Active Projects" value={0} subtitle="0 milestones due" icon={FolderKanban} />
        <StatCard label="Savings Rate" value="—" subtitle="No data yet" icon={TrendingUp} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-base font-medium text-foreground">Today's Tasks</h2>
          <p className="mt-1 text-xs text-muted-foreground">Your curated focus for today</p>
          <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
            <CheckSquare className="h-10 w-10 text-muted" />
            <p className="mt-3 text-sm text-muted-foreground">No tasks for today</p>
            <p className="mt-1 text-xs text-muted">
              Use Quick Capture or the Tasks module to add tasks
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-base font-medium text-foreground">Upcoming Events</h2>
          <p className="mt-1 text-xs text-muted-foreground">Next 7 days</p>
          <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-10 w-10 text-muted" />
            <p className="mt-3 text-sm text-muted-foreground">No upcoming events</p>
            <p className="mt-1 text-xs text-muted">Events will appear here once you add them</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-base font-medium text-foreground">Recent Transactions</h2>
          <p className="mt-1 text-xs text-muted-foreground">Last 5 transactions</p>
          <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
            <Wallet className="h-10 w-10 text-muted" />
            <p className="mt-3 text-sm text-muted-foreground">No transactions yet</p>
            <p className="mt-1 text-xs text-muted">Add your first expense or income</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-base font-medium text-foreground">Active Reminders</h2>
          <p className="mt-1 text-xs text-muted-foreground">Pending reminders</p>
          <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-10 w-10 text-muted" />
            <p className="mt-3 text-sm text-muted-foreground">No active reminders</p>
            <p className="mt-1 text-xs text-muted">Reminders will show up here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
