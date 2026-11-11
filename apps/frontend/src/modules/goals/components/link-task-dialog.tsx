import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Circle } from 'lucide-react';
import { useTasks } from '@/modules/tasks/hooks/use-tasks';
import { useLinkTaskToGoal } from '../hooks/use-goals';
import { cn } from '@/lib/utils';
import type { Task, Priority } from '@lifeos/shared';

interface LinkTaskDialogProps {
  open: boolean;
  onClose: () => void;
  linkedTaskIds: string[];
  goalId: string;
}

const priorityColors: Record<Priority, string> = {
  low: 'text-muted-foreground',
  medium: 'text-primary',
  high: 'text-warning',
  urgent: 'text-danger',
};

export function LinkTaskDialog({ open, onClose, linkedTaskIds, goalId }: LinkTaskDialogProps) {
  const [search, setSearch] = useState('');
  const [justLinked, setJustLinked] = useState<string[]>([]);
  const linkTask = useLinkTaskToGoal();
  const { data, isLoading } = useTasks({
    search: search || undefined,
    status: ['todo', 'in_progress'],
    limit: 20,
  });

  if (!open) return null;

  const tasks = data?.data ?? [];
  const allLinked = [...linkedTaskIds, ...justLinked];
  const availableTasks = tasks.filter((t: Task) => !allLinked.includes(t.id));

  const handleClose = () => {
    setJustLinked([]);
    setSearch('');
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 animate-overlay-in" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-hidden rounded-lg border border-border bg-card shadow-xl flex flex-col animate-dialog-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Link Tasks</h2>
          <button onClick={handleClose} className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-input pl-9 pr-3 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 max-h-[400px]">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 rounded-md bg-card-hover animate-pulse" />
              ))}
            </div>
          ) : availableTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">
                {search ? 'No matching tasks found' : 'No available tasks to link'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {availableTasks.map((task: Task) => (
                <button
                  key={task.id}
                  onClick={() => {
                    linkTask.mutate({ goalId, taskId: task.id });
                    setJustLinked((prev) => [...prev, task.id]);
                  }}
                  className="flex w-full items-start gap-3 rounded-md p-2.5 text-left transition-colors hover:bg-card-hover"
                >
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground truncate">{task.title}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs">
                      <span className={cn(priorityColors[task.priority])}>{task.priority}</span>
                      {task.category && <span className="text-muted-foreground">{task.category}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {justLinked.length > 0 && (
          <div className="shrink-0 flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">
              {justLinked.length} task{justLinked.length > 1 ? 's' : ''} linked
            </span>
            <button
              onClick={handleClose}
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
