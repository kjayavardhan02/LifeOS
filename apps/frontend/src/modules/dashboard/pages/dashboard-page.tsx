import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Calendar,
  Bell,
  Wallet,
  FolderKanban,
  TrendingUp,
  Circle,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';
import { useAuthStore } from '@/stores/auth-store';
import { useTasks } from '@/modules/tasks/hooks/use-tasks';
import { useUpcomingEvents } from '@/modules/calendar/hooks/use-events';
import { useActiveReminders } from '@/modules/reminders/hooks/use-reminders';
import { useFinanceSummary, useRecentTransactions } from '@/modules/finance/hooks/use-transactions';
import { cn } from '@/lib/utils';
import { format, isPast, isToday } from 'date-fns';
import type { Task, CalendarEvent, Reminder, FinanceTransaction } from '@lifeos/shared';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning 🌅';
  if (hour < 17) return 'Good afternoon ☀️';
  return 'Good evening 🌙';
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] || 'there';

  const { data: openData } = useTasks({ status: ['todo', 'in_progress'], limit: 100 });
  const { data: myDayData } = useTasks({ isMyDay: true, limit: 20 });
  const { data: upcomingData } = useUpcomingEvents(7);
  const { data: activeRemindersData } = useActiveReminders();

  const now = new Date();
  const { data: summaryData } = useFinanceSummary(now.getMonth() + 1, now.getFullYear());
  const { data: recentTxData } = useRecentTransactions(5);

  const openTasks = openData?.data ?? [];
  const myDayTasks = myDayData?.data ?? [];
  const upcomingEvents = upcomingData?.data ?? [];
  const activeReminders = activeRemindersData?.data ?? [];
  const totalOpen = openData?.meta?.total ?? 0;
  const dueToday = openTasks.filter((t) => t.dueDate && isToday(new Date(t.dueDate))).length;
  const overdue = openTasks.filter((t) => t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate))).length;
  const todayEvents = upcomingEvents.filter((e) => isToday(new Date(e.startDate)));

  const todayTasks = myDayTasks.length > 0 ? myDayTasks : openTasks.filter((t) => t.dueDate && isToday(new Date(t.dueDate)));

  const financeSummary = summaryData?.data;
  const totalExpense = financeSummary?.totalExpense ?? 0;
  const recentTransactions = recentTxData?.data ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">
          {getGreeting()}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your life at a glance — updated just now
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {[
          <StatCard key="tasks" label="Open Tasks" value={totalOpen} subtitle={dueToday > 0 ? `${dueToday} due today` : 'None due today'} icon={CheckSquare} />,
          <StatCard key="events" label="Today's Events" value={todayEvents.length} subtitle={todayEvents.length > 0 ? `${upcomingEvents.length} this week` : 'No events today'} icon={Calendar} />,
          <StatCard key="reminders" label="Active Reminders" value={activeReminders.length} subtitle={activeReminders.length > 0 ? `${activeReminders.filter((r) => isPast(new Date(r.dueDate)) && !isToday(new Date(r.dueDate))).length} overdue` : 'None pending'} icon={Bell} />,
          <StatCard key="finance" label="This Month" value={`₹${totalExpense.toLocaleString('en-IN')}`} subtitle="Spent so far" icon={Wallet} />,
          <StatCard key="projects" label="Active Projects" value={0} subtitle="0 milestones due" icon={FolderKanban} />,
          <StatCard key="overdue" label="Overdue" value={overdue} subtitle={overdue > 0 ? 'Need attention' : 'All on track'} icon={AlertTriangle} className={overdue > 0 ? 'border-danger/30' : undefined} />,
        ].map((card, i) => (
          <div key={card.key} className="animate-card-in" style={{ '--i': i } as React.CSSProperties}>
            {card}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5 animate-card-in" style={{ '--i': 0 } as React.CSSProperties}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-medium text-foreground">Today's Tasks</h2>
              <p className="mt-1 text-xs text-muted-foreground">Your curated focus for today</p>
            </div>
            <button
              onClick={() => navigate('/tasks')}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          {todayTasks.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
              <CheckSquare className="h-10 w-10 text-muted" />
              <p className="mt-3 text-sm text-muted-foreground">No tasks for today</p>
              <p className="mt-1 text-xs text-muted">
                Use Quick Capture or the Tasks module to add tasks
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-1.5">
              {todayTasks.slice(0, 5).map((task) => (
                <DashboardTaskItem key={task.id} task={task} onClick={() => navigate('/tasks')} />
              ))}
              {todayTasks.length > 5 && (
                <p className="pt-1 text-center text-xs text-muted">
                  +{todayTasks.length - 5} more tasks
                </p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-5 animate-card-in" style={{ '--i': 1 } as React.CSSProperties}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-medium text-foreground">Upcoming Events</h2>
              <p className="mt-1 text-xs text-muted-foreground">Next 7 days</p>
            </div>
            <button
              onClick={() => navigate('/calendar')}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          {upcomingEvents.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="h-10 w-10 text-muted" />
              <p className="mt-3 text-sm text-muted-foreground">No upcoming events</p>
              <p className="mt-1 text-xs text-muted">Events will appear here once you add them</p>
            </div>
          ) : (
            <div className="mt-4 space-y-1.5">
              {upcomingEvents.slice(0, 5).map((event) => (
                <DashboardEventItem key={event.id} event={event} onClick={() => navigate('/calendar')} />
              ))}
              {upcomingEvents.length > 5 && (
                <p className="pt-1 text-center text-xs text-muted">
                  +{upcomingEvents.length - 5} more events
                </p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-5 animate-card-in" style={{ '--i': 2 } as React.CSSProperties}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-medium text-foreground">Recent Transactions</h2>
              <p className="mt-1 text-xs text-muted-foreground">Last 5 transactions</p>
            </div>
            <button
              onClick={() => navigate('/finance')}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          {recentTransactions.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
              <Wallet className="h-10 w-10 text-muted" />
              <p className="mt-3 text-sm text-muted-foreground">No transactions yet</p>
              <p className="mt-1 text-xs text-muted">Add your first expense or income</p>
            </div>
          ) : (
            <div className="mt-4 space-y-1.5">
              {recentTransactions.map((tx) => (
                <DashboardTransactionItem key={tx.id} transaction={tx} onClick={() => navigate('/finance')} />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-5 animate-card-in" style={{ '--i': 3 } as React.CSSProperties}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-medium text-foreground">Active Reminders</h2>
              <p className="mt-1 text-xs text-muted-foreground">Pending & snoozed</p>
            </div>
            <button
              onClick={() => navigate('/reminders')}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          {activeReminders.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-10 w-10 text-muted" />
              <p className="mt-3 text-sm text-muted-foreground">No active reminders</p>
              <p className="mt-1 text-xs text-muted">Reminders will show up here</p>
            </div>
          ) : (
            <div className="mt-4 space-y-1.5">
              {activeReminders.slice(0, 5).map((reminder) => (
                <DashboardReminderItem key={reminder.id} reminder={reminder} onClick={() => navigate('/reminders')} />
              ))}
              {activeReminders.length > 5 && (
                <p className="pt-1 text-center text-xs text-muted">
                  +{activeReminders.length - 5} more reminders
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardTaskItem({ task, onClick }: { task: Task; onClick: () => void }) {
  const isDone = task.status === 'done';
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-card-hover"
    >
      {isDone ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
      ) : (
        <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
      )}
      <span className={cn('flex-1 truncate text-sm', isDone && 'line-through text-muted-foreground')}>
        {task.title}
      </span>
      {task.dueDate && (
        <span className={cn('text-xs shrink-0', isOverdue ? 'text-danger' : 'text-muted-foreground')}>
          {format(new Date(task.dueDate), 'MMM d')}
        </span>
      )}
      <span
        className={cn(
          'rounded px-1.5 py-0.5 text-xs',
          task.priority === 'urgent' && 'bg-danger/15 text-danger',
          task.priority === 'high' && 'bg-warning/15 text-warning',
          task.priority === 'medium' && 'bg-primary/15 text-primary',
          task.priority === 'low' && 'bg-card-hover text-muted-foreground',
        )}
      >
        {task.priority}
      </span>
    </button>
  );
}

function DashboardReminderItem({ reminder, onClick }: { reminder: Reminder; onClick: () => void }) {
  const isOverdue = isPast(new Date(reminder.dueDate)) && !isToday(new Date(reminder.dueDate));

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-card-hover"
    >
      <Bell className={cn('h-4 w-4 shrink-0', isOverdue ? 'text-danger' : 'text-muted-foreground')} />
      <span className="flex-1 truncate text-sm text-foreground">{reminder.title}</span>
      <span className={cn('text-xs shrink-0', isOverdue ? 'text-danger' : 'text-muted-foreground')}>
        {isOverdue ? 'Overdue · ' : ''}
        {format(new Date(reminder.dueDate), 'MMM d, h:mm a')}
      </span>
      <span
        className={cn(
          'rounded px-1.5 py-0.5 text-xs',
          reminder.priority === 'urgent' && 'bg-danger/15 text-danger',
          reminder.priority === 'high' && 'bg-warning/15 text-warning',
          reminder.priority === 'medium' && 'bg-primary/15 text-primary',
          reminder.priority === 'low' && 'bg-card-hover text-muted-foreground',
        )}
      >
        {reminder.priority}
      </span>
    </button>
  );
}

function DashboardTransactionItem({ transaction, onClick }: { transaction: FinanceTransaction; onClick: () => void }) {
  const isIncome = transaction.type === 'income';
  const amount = transaction.amount;
  const formattedAmount = `${isIncome ? '+' : '-'}₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-card-hover"
    >
      {isIncome ? (
        <TrendingUp className="h-4 w-4 shrink-0 text-success" />
      ) : (
        <Wallet className="h-4 w-4 shrink-0 text-danger" />
      )}
      <span className="flex-1 truncate text-sm text-foreground">
        {transaction.merchant || transaction.category}
      </span>
      <span className="text-xs shrink-0 text-muted-foreground">
        {format(new Date(transaction.date), 'MMM d')}
      </span>
      <span className={cn('text-sm font-medium shrink-0', isIncome ? 'text-success' : 'text-danger')}>
        {formattedAmount}
      </span>
    </button>
  );
}

function DashboardEventItem({ event, onClick }: { event: CalendarEvent; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-card-hover"
    >
      <div className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: event.color }} />
      <span className="flex-1 truncate text-sm text-foreground">{event.title}</span>
      <span className="text-xs shrink-0 text-muted-foreground">
        {event.isAllDay
          ? format(new Date(event.startDate), 'MMM d')
          : format(new Date(event.startDate), 'MMM d, h:mm a')}
      </span>
      <span className="rounded px-1.5 py-0.5 text-xs" style={{ backgroundColor: event.color + '15', color: event.color }}>
        {event.category}
      </span>
    </button>
  );
}
