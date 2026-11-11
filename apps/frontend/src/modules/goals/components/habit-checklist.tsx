import { Check, Flame, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Habit, HabitLog } from '@lifeos/shared';

interface HabitChecklistProps {
  habits: Array<Habit & { todayLog: HabitLog | null }>;
  onToggle: (habitId: string, completed: boolean) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

export function HabitChecklist({ habits, onToggle, onEdit, onDelete }: HabitChecklistProps) {
  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-muted-foreground">No habits scheduled for today</p>
        <p className="mt-1 text-xs text-muted">Create a habit to start tracking</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {habits.map((habit) => {
        const isCompleted = habit.todayLog !== null && habit.todayLog.value > 0;

        return (
          <div
            key={habit.id}
            className="group flex items-center gap-3 rounded-lg border border-border p-3 transition-all hover:border-border-hover"
          >
            <button
              onClick={() => onToggle(habit.id, !isCompleted)}
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                isCompleted
                  ? 'border-transparent bg-success text-white'
                  : 'border-border hover:border-primary',
              )}
            >
              {isCompleted && <Check className="h-3.5 w-3.5" />}
            </button>

            <div
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: habit.color }}
            />

            <div className="min-w-0 flex-1">
              <p className={cn(
                'text-sm font-medium transition-colors',
                isCompleted ? 'text-muted-foreground line-through' : 'text-foreground',
              )}>
                {habit.name}
              </p>
              {habit.unit && habit.targetCount > 1 && (
                <p className="text-xs text-muted-foreground">
                  Target: {habit.targetCount} {habit.unit}
                </p>
              )}
            </div>

            {habit.streakCurrent > 0 && (
              <div className="flex items-center gap-1 text-xs font-medium text-warning">
                <Flame className="h-3.5 w-3.5" />
                {habit.streakCurrent}
              </div>
            )}

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const menu = e.currentTarget.nextElementSibling;
                  menu?.classList.toggle('hidden');
                }}
                className="rounded-md p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground transition-all"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              <div className="hidden absolute right-0 top-8 z-10 w-32 rounded-md border border-border bg-card py-1 shadow-lg">
                <button
                  onClick={() => onEdit(habit)}
                  className="w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-card-hover"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(habit.id)}
                  className="w-full px-3 py-1.5 text-left text-xs text-danger hover:bg-card-hover"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
