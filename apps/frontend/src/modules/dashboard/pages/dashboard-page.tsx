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
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getGreetingEmoji(): string {
  const hour = new Date().getHours();
  if (hour < 12) return '🌅';
  if (hour < 17) return '☀️';
  return '🌙';
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
      <div className="mb-8 animate-page-in">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getGreetingEmoji()}</span>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {getGreeting()}, <span className="gradient-text-primary">{firstName}</span>
            </h1>
            <p className="mt-1 text-sm text-muted">
              {format(new Date(), 'EEEE, MMMM d')} — Your life at a glance
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {([
          { key: 'tasks', label: 'Open Tasks', value: totalOpen, subtitle: dueToday > 0 ? `${dueToday} due today` : 'None due today', icon: CheckSquare, accent: 'primary' as const },
          { key: 'events', label: "Today's Events", value: todayEvents.length, subtitle: todayEvents.length > 0 ? `${upcomingEvents.length} this week` : 'No events today', icon: Calendar, accent: 'info' as const },
          { key: 'reminders', label: 'Active Reminders', value: activeReminders.length, subtitle: activeReminders.length > 0 ? `${activeReminders.filter((r) => isPast(new Date(r.dueDate)) && !isToday(new Date(r.dueDate))).length} overdue` : 'None pending', icon: Bell, accent: 'warning' as const },
          { key: 'finance', label: 'This Month', value: `₹${totalExpense.toLocaleString('en-IN')}`, subtitle: 'Spent so far', icon: Wallet, accent: 'success' as const },
          { key: 'projects', label: 'Active Projects', value: 0, subtitle: '0 milestones due', icon: FolderKanban, accent: 'info' as const },
          { key: 'overdue', label: 'Overdue', value: overdue, subtitle: overdue > 0 ? 'Need attention' : 'All on track', icon: AlertTriangle, accent: 'danger' as const },
        ]).map((card, i) => (
          <div key={card.key} className="animate-card-in" style={{ '--i': i } as React.CSSProperties}>
            <StatCard
              label={card.label}
              value={card.value}
              subtitle={card.subtitle}
              icon={card.icon}
              accent={card.accent}
            />
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <DashboardSection
          title="Today's Tasks"
          subtitle="Your curated focus for today"
          onViewAll={() => navigate('/tasks')}
          emptyIcon={<CheckSquare className="h-10 w-10 text-muted" />}
          emptyTitle="No tasks for today"
          emptySubtitle="Use Quick Capture or the Tasks module to add tasks"
          isEmpty={todayTasks.length === 0}
          index={0}
        >
          <div className="space-y-1">
            {todayTasks.slice(0, 5).map((task) => (
              <DashboardTaskItem key={task.id} task={task} onClick={() => navigate('/tasks')} />
            ))}
            {todayTasks.length > 5 && (
              <p className="pt-2 text-center text-xs text-muted">
                +{todayTasks.length - 5} more tasks
              </p>
            )}
          </div>
        </DashboardSection>

        <DashboardSection
          title="Upcoming Events"
          subtitle="Next 7 days"
          onViewAll={() => navigate('/calendar')}
          emptyIcon={<Calendar className="h-10 w-10 text-muted" />}
          emptyTitle="No upcoming events"
          emptySubtitle="Events will appear here once you add them"
          isEmpty={upcomingEvents.length === 0}
          index={1}
        >
          <div className="space-y-1">
            {upcomingEvents.slice(0, 5).map((event) => (
              <DashboardEventItem key={event.id} event={event} onClick={() => navigate('/calendar')} />
            ))}
            {upcomingEvents.length > 5 && (
              <p className="pt-2 text-center text-xs text-muted">
                +{upcomingEvents.length - 5} more events
              </p>
            )}
          </div>
        </DashboardSection>

        <DashboardSection
          title="Recent Transactions"
          subtitle="Last 5 transactions"
          onViewAll={() => navigate('/finance')}
          emptyIcon={<Wallet className="h-10 w-10 text-muted" />}
          emptyTitle="No transactions yet"
          emptySubtitle="Add your first expense or income"
          isEmpty={recentTransactions.length === 0}
          index={2}
        >
          <div className="space-y-1">
            {recentTransactions.map((tx) => (
              <DashboardTransactionItem key={tx.id} transaction={tx} onClick={() => navigate('/finance')} />
            ))}
          </div>
        </DashboardSection>

        <DashboardSection
          title="Active Reminders"
          subtitle="Pending & snoozed"
          onViewAll={() => navigate('/reminders')}
          emptyIcon={<Bell className="h-10 w-10 text-muted" />}
          emptyTitle="No active reminders"
          emptySubtitle="Reminders will show up here"
          isEmpty={activeReminders.length === 0}
          index={3}
        >
          <div className="space-y-1">
            {activeReminders.slice(0, 5).map((reminder) => (
              <DashboardReminderItem key={reminder.id} reminder={reminder} onClick={() => navigate('/reminders')} />
            ))}
            {activeReminders.length > 5 && (
              <p className="pt-2 text-center text-xs text-muted">
                +{activeReminders.length - 5} more reminders
              </p>
            )}
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}

function DashboardSection({
  title,
  subtitle,
  onViewAll,
  emptyIcon,
  emptyTitle,
  emptySubtitle,
  isEmpty,
  index,
  children,
}: {
  title: string;
  subtitle: string;
  onViewAll: () => void;
  emptyIcon: React.ReactNode;
  emptyTitle: string;
  emptySubtitle: string;
  isEmpty: boolean;
  index: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="group rounded-xl border border-border bg-card overflow-hidden card-interactive animate-card-in"
      style={{ '--i': index } as React.CSSProperties}
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
        </div>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-primary hover:bg-[#5B9BF0]/10 transition-colors"
        >
          View all <ChevronRight className="h-3 w-3" />
        </button>
      </div>
      <div className="px-5 pb-5">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            {emptyIcon}
            <p className="mt-3 text-sm text-muted-foreground">{emptyTitle}</p>
            <p className="mt-1 text-xs text-muted">{emptySubtitle}</p>
          </div>
        ) : (
          children
        )}
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
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all hover:bg-card-hover group/item"
    >
      {isDone ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
      ) : (
        <Circle className="h-4 w-4 shrink-0 text-muted-foreground group-hover/item:text-primary transition-colors" />
      )}
      <span className={cn('flex-1 truncate text-sm', isDone && 'line-through text-muted-foreground')}>
        {task.title}
      </span>
      {task.dueDate && (
        <span className={cn('text-xs shrink-0', isOverdue ? 'text-danger' : 'text-muted')}>
          {format(new Date(task.dueDate), 'MMM d')}
        </span>
      )}
      <span
        className={cn(
          'rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider',
          task.priority === 'urgent' && 'bg-[#E05A52]/15 text-[#E05A52]',
          task.priority === 'high' && 'bg-[#F5C344]/15 text-[#F5C344]',
          task.priority === 'medium' && 'bg-[#5B9BF0]/15 text-[#5B9BF0]',
          task.priority === 'low' && 'bg-card-hover text-muted',
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
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all hover:bg-card-hover"
    >
      <Bell className={cn('h-4 w-4 shrink-0', isOverdue ? 'text-danger' : 'text-muted-foreground')} />
      <span className="flex-1 truncate text-sm text-foreground">{reminder.title}</span>
      <span className={cn('text-xs shrink-0', isOverdue ? 'text-danger' : 'text-muted')}>
        {isOverdue ? 'Overdue · ' : ''}
        {format(new Date(reminder.dueDate), 'MMM d, h:mm a')}
      </span>
      <span
        className={cn(
          'rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider',
          reminder.priority === 'urgent' && 'bg-[#E05A52]/15 text-[#E05A52]',
          reminder.priority === 'high' && 'bg-[#F5C344]/15 text-[#F5C344]',
          reminder.priority === 'medium' && 'bg-[#5B9BF0]/15 text-[#5B9BF0]',
          reminder.priority === 'low' && 'bg-card-hover text-muted',
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
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all hover:bg-card-hover"
    >
      <div className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
        isIncome ? 'bg-[#2BD47D]/10' : 'bg-[#E05A52]/10',
      )}>
        {isIncome ? (
          <TrendingUp className="h-3.5 w-3.5 text-[#2BD47D]" />
        ) : (
          <Wallet className="h-3.5 w-3.5 text-[#E05A52]" />
        )}
      </div>
      <span className="flex-1 truncate text-sm text-foreground">
        {transaction.merchant || transaction.category}
      </span>
      <span className="text-xs shrink-0 text-muted">
        {format(new Date(transaction.date), 'MMM d')}
      </span>
      <span className={cn('text-sm font-semibold shrink-0 tabular-nums', isIncome ? 'text-[#2BD47D]' : 'text-[#E05A52]')}>
        {formattedAmount}
      </span>
    </button>
  );
}

function DashboardEventItem({ event, onClick }: { event: CalendarEvent; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all hover:bg-card-hover"
    >
      <div
        className="h-2.5 w-2.5 shrink-0 rounded-full shadow-[0_0_6px_currentColor]"
        style={{ backgroundColor: event.color, color: event.color }}
      />
      <span className="flex-1 truncate text-sm text-foreground">{event.title}</span>
      <span className="text-xs shrink-0 text-muted">
        {event.isAllDay
          ? format(new Date(event.startDate), 'MMM d')
          : format(new Date(event.startDate), 'MMM d, h:mm a')}
      </span>
      <span
        className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
        style={{ backgroundColor: event.color + '18', color: event.color }}
      >
        {event.category}
      </span>
    </button>
  );
}
