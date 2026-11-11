import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { PriorityBadge } from './priority-badge';
import type { Task } from '@lifeos/shared';

interface TaskCalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function TaskCalendarView({ tasks, onTaskClick }: TaskCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const tasksByDate = new Map<string, Task[]>();
  for (const task of tasks) {
    if (!task.dueDate) continue;
    const key = format(new Date(task.dueDate), 'yyyy-MM-dd');
    const existing = tasksByDate.get(key) ?? [];
    existing.push(task);
    tasksByDate.set(key, existing);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="rounded-md border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border">
          {WEEKDAYS.map((day) => (
            <div key={day} className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayTasks = tasksByDate.get(key) ?? [];
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);

            return (
              <div
                key={i}
                className={cn(
                  'min-h-[100px] border-b border-r border-border p-1.5 transition-colors',
                  !inMonth && 'bg-background/50',
                  today && 'bg-primary/5',
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs',
                      today ? 'bg-primary text-primary-foreground font-bold' : inMonth ? 'text-foreground' : 'text-muted',
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-xs text-muted">{dayTasks.length}</span>
                  )}
                </div>
                <div className="space-y-0.5">
                  {dayTasks.slice(0, 3).map((task) => (
                    <button
                      key={task.id}
                      onClick={() => onTaskClick(task)}
                      className={cn(
                        'w-full truncate rounded px-1.5 py-0.5 text-left text-xs transition-colors hover:opacity-80',
                        task.status === 'done'
                          ? 'bg-success/15 text-success line-through'
                          : task.priority === 'urgent'
                            ? 'bg-danger/15 text-danger'
                            : task.priority === 'high'
                              ? 'bg-warning/15 text-warning'
                              : 'bg-card-hover text-foreground',
                      )}
                    >
                      {task.title}
                    </button>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="block text-center text-xs text-muted">
                      +{dayTasks.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
