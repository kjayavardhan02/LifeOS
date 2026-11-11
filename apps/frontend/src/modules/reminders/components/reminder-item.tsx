import { useState } from 'react';
import { format, isPast, isToday } from 'date-fns';
import { Bell, BellOff, Check, Clock, ChevronRight, AlarmClock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SNOOZE_OPTIONS } from '@lifeos/shared';
import type { Reminder } from '@lifeos/shared';

interface ReminderItemProps {
  reminder: Reminder;
  onDone: (id: string) => void;
  onDismiss: (id: string) => void;
  onSnooze: (id: string, minutes: number) => void;
  onClick: (reminder: Reminder) => void;
}

const priorityColors: Record<string, string> = {
  urgent: 'bg-danger/15 text-danger',
  high: 'bg-warning/15 text-warning',
  medium: 'bg-primary/15 text-primary',
  low: 'bg-card-hover text-muted-foreground',
};

export function ReminderItem({ reminder, onDone, onDismiss, onSnooze, onClick }: ReminderItemProps) {
  const [showSnooze, setShowSnooze] = useState(false);
  const isOverdue = isPast(new Date(reminder.dueDate)) && !isToday(new Date(reminder.dueDate));
  const isDone = reminder.status === 'done';
  const isDismissed = reminder.status === 'dismissed';
  const isSnoozed = reminder.status === 'snoozed';

  return (
    <div className={cn(
      'group rounded-lg border border-border bg-card transition-colors hover:bg-card-hover',
      isOverdue && !isDone && !isDismissed && 'border-danger/30',
    )}>
      <div className="flex items-center gap-3 p-3">
        <button
          onClick={() => onDone(reminder.id)}
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
            isDone
              ? 'border-success bg-success text-white'
              : 'border-muted-foreground/30 hover:border-success hover:bg-success/10',
          )}
        >
          {isDone && <Check className="h-3.5 w-3.5" />}
        </button>

        <button onClick={() => onClick(reminder)} className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-sm font-medium truncate',
              (isDone || isDismissed) && 'line-through text-muted-foreground',
            )}>
              {reminder.title}
            </span>
            {isSnoozed && <AlarmClock className="h-3.5 w-3.5 shrink-0 text-warning" />}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs">
            <span className={cn(
              isOverdue && !isDone && !isDismissed ? 'text-danger font-medium' : 'text-muted-foreground',
            )}>
              {isOverdue && !isDone && !isDismissed ? 'Overdue · ' : ''}
              {format(new Date(reminder.dueDate), 'MMM d, h:mm a')}
            </span>
            {isSnoozed && reminder.snoozedUntil && (
              <span className="text-warning">
                Snoozed until {format(new Date(reminder.snoozedUntil), 'h:mm a')}
              </span>
            )}
          </div>
        </button>

        <span className={cn('rounded px-1.5 py-0.5 text-xs shrink-0', priorityColors[reminder.priority])}>
          {reminder.priority}
        </span>

        <span className="rounded px-1.5 py-0.5 text-xs shrink-0 bg-card-hover text-muted-foreground">
          {reminder.category}
        </span>

        {!isDone && !isDismissed && (
          <div className="flex items-center gap-1 shrink-0">
            <div className="relative">
              <button
                onClick={() => setShowSnooze(!showSnooze)}
                className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                title="Snooze"
              >
                <Clock className="h-4 w-4" />
              </button>
              {showSnooze && (
                <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-md border border-border bg-card py-1 shadow-lg animate-dialog-in origin-top-right">
                  {SNOOZE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { onSnooze(reminder.id, opt.value); setShowSnooze(false); }}
                      className="w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-card-hover transition-colors"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => onDismiss(reminder.id)}
              className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              title="Dismiss"
            >
              <BellOff className="h-4 w-4" />
            </button>
          </div>
        )}

        <ChevronRight className="h-4 w-4 shrink-0 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
