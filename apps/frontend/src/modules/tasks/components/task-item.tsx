import { Circle, CheckCircle2, ChevronRight, Calendar as CalendarIcon, Clock, Star, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriorityBadge } from './priority-badge';
import { StatusBadge } from './status-badge';
import type { Task, Priority } from '@lifeos/shared';
import { format, isPast, isToday } from 'date-fns';

const DAY_LABELS: Record<string, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };

const PRIORITY_ACCENT: Record<Priority, string> = {
  urgent: 'border-l-[#E05A52]',
  high: 'border-l-[#F5C344]',
  medium: 'border-l-[#5B9BF0]',
  low: 'border-l-[#6B6966]',
};

function formatRecurrence(task: Task): string {
  const interval = task.recurrenceInterval ?? 1;
  const pattern = task.recurrencePattern ?? 'daily';
  const units: Record<string, [string, string]> = { daily: ['day', 'days'], weekly: ['week', 'weeks'], monthly: ['month', 'months'], yearly: ['year', 'years'] };
  const [singular, plural] = units[pattern] ?? [pattern, pattern];
  let label = interval === 1 ? `${pattern.charAt(0).toUpperCase()}${pattern.slice(1)}` : `Every ${interval} ${plural}`;
  if (pattern === 'weekly' && task.recurrenceDays?.length > 0) {
    label += ` (${task.recurrenceDays.map((d) => DAY_LABELS[d] ?? d).join(', ')})`;
  }
  return label;
}

interface TaskItemProps {
  task: Task;
  onToggleStatus: (task: Task) => void;
  onToggleMyDay?: (task: Task) => void;
  onClick: (task: Task) => void;
}

export function TaskItem({ task, onToggleStatus, onToggleMyDay, onClick }: TaskItemProps) {
  const isDone = task.status === 'done' || task.status === 'cancelled';
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isDone;
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));
  const completedSubtasks = task.subtasks.filter((s) => s.isCompleted).length;

  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-xl border border-border border-l-[3px] bg-card px-4 py-3 transition-all hover:border-border-hover hover:bg-card-hover/50 cursor-pointer',
        PRIORITY_ACCENT[task.priority],
        isDone && 'opacity-50',
      )}
      onClick={() => onClick(task)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleStatus(task);
        }}
        className="shrink-0 text-muted-foreground hover:text-primary transition-colors hover:scale-110 active:scale-95"
      >
        {isDone ? (
          <CheckCircle2 className="h-5 w-5 text-success" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('text-sm font-medium text-foreground truncate', isDone && 'line-through text-muted-foreground')}>
            {task.title}
          </span>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />

          {task.category && (
            <span className="text-xs text-muted">{task.category}</span>
          )}

          {task.dueDate && (
            <span className={cn(
              'flex items-center gap-1 text-xs font-medium',
              isOverdue ? 'text-[#E05A52]' : isDueToday ? 'text-[#F5C344]' : 'text-muted',
            )}>
              <CalendarIcon className="h-3 w-3" />
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}

          {task.estimatedMinutes && (
            <span className="flex items-center gap-1 text-xs text-muted">
              <Clock className="h-3 w-3" />
              {task.estimatedMinutes}m
            </span>
          )}

          {task.isRecurring && (
            <span className="flex items-center gap-1 rounded-md bg-[#5B9BF0]/10 px-1.5 py-0.5 text-xs font-medium text-[#5B9BF0]">
              <Repeat className="h-3 w-3" />
              {formatRecurrence(task)}
            </span>
          )}

          {task.subtasks.length > 0 && (
            <span className="text-xs text-muted">
              {completedSubtasks}/{task.subtasks.length} subtasks
            </span>
          )}

          {task.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-card-hover px-1.5 py-0.5 text-[10px] font-medium text-muted uppercase tracking-wider">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {onToggleMyDay && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMyDay(task);
          }}
          className="shrink-0 text-muted-foreground hover:text-warning transition-all hover:scale-110"
          title={task.isMyDay ? 'Remove from My Day' : 'Add to My Day'}
        >
          <Star className={cn('h-4 w-4', task.isMyDay && 'fill-warning text-warning')} />
        </button>
      )}
      <ChevronRight className="h-4 w-4 shrink-0 text-muted opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
    </div>
  );
}
