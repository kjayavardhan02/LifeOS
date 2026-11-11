import { Circle, CheckCircle2, ChevronRight, Calendar as CalendarIcon, Clock, Star, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriorityBadge } from './priority-badge';
import { StatusBadge } from './status-badge';
import type { Task } from '@lifeos/shared';
import { format, isPast, isToday } from 'date-fns';

const DAY_LABELS: Record<string, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };

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
        'group flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-border-hover cursor-pointer',
        isDone && 'opacity-60',
      )}
      onClick={() => onClick(task)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleStatus(task);
        }}
        className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
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

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />

          {task.category && (
            <span className="text-xs text-muted-foreground">{task.category}</span>
          )}

          {task.dueDate && (
            <span className={cn(
              'flex items-center gap-1 text-xs',
              isOverdue ? 'text-danger' : isDueToday ? 'text-warning' : 'text-muted-foreground',
            )}>
              <CalendarIcon className="h-3 w-3" />
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}

          {task.estimatedMinutes && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {task.estimatedMinutes}m
            </span>
          )}

          {task.isRecurring && (
            <span className="flex items-center gap-1 text-xs text-primary">
              <Repeat className="h-3 w-3" />
              {formatRecurrence(task)}
            </span>
          )}

          {task.subtasks.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {completedSubtasks}/{task.subtasks.length} subtasks
            </span>
          )}

          {task.tags.map((tag) => (
            <span key={tag} className="rounded bg-card-hover px-1.5 py-0.5 text-xs text-muted-foreground">
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
          className="shrink-0 text-muted-foreground hover:text-warning transition-colors"
          title={task.isMyDay ? 'Remove from My Day' : 'Add to My Day'}
        >
          <Star className={cn('h-4 w-4', task.isMyDay && 'fill-warning text-warning')} />
        </button>
      )}
      <ChevronRight className="h-4 w-4 shrink-0 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
