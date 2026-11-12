import { useState } from 'react';
import { Plus, List, LayoutGrid, Star, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTasks, useCreateTask, useUpdateTask } from '../hooks/use-tasks';
import { TaskFilters } from '../components/task-filters';
import { TaskItem } from '../components/task-item';
import { TaskDialog } from '../components/task-dialog';
import { TaskDetailPanel } from '../components/task-detail-panel';
import { KanbanBoard } from '../components/kanban-board';
import { TaskCalendarView } from '../components/task-calendar-view';
import type { Task, TaskFilters as TaskFiltersType, CreateTaskInput, UpdateTaskInput } from '@lifeos/shared';

type ViewMode = 'list' | 'kanban' | 'myday' | 'calendar';

const viewOptions: { mode: ViewMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { mode: 'list', label: 'List', icon: List },
  { mode: 'kanban', label: 'Kanban', icon: LayoutGrid },
  { mode: 'calendar', label: 'Calendar', icon: CalendarIcon },
  { mode: 'myday', label: 'My Day', icon: Star },
];

export function TasksPage() {
  const [view, setView] = useState<ViewMode>('list');
  const [filters, setFilters] = useState<TaskFiltersType>({});
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [page, setPage] = useState(1);

  const queryFilters = view === 'myday' ? { ...filters, isMyDay: true } : filters;
  const limit = view === 'calendar' ? 100 : 50;
  const { data, isLoading } = useTasks({ ...queryFilters, page, limit, sortBy, sortOrder });
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const tasks = data?.data ?? [];
  const meta = data?.meta;

  const handleSubmit = (input: CreateTaskInput | (UpdateTaskInput & { id: string })) => {
    if ('id' in input) {
      updateTask.mutate(input, { onSuccess: () => { setDialogOpen(false); setEditingTask(null); } });
    } else {
      const createInput = view === 'myday' ? { ...input, isMyDay: true } : input;
      createTask.mutate(createInput, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleToggleStatus = (task: Task) => {
    updateTask.mutate({
      id: task.id,
      status: task.status === 'done' ? 'todo' : 'done',
    });
  };

  const handleToggleMyDay = (task: Task) => {
    updateTask.mutate({ id: task.id, isMyDay: !task.isMyDay });
  };

  const handleSortChange = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-page-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {view === 'myday' ? 'My Day' : 'Task Management'}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {view === 'myday'
              ? 'Your curated focus for today'
              : `${meta?.total ?? 0} tasks total`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-border bg-card p-1">
            {viewOptions.map(({ mode, label, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => setView(mode)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-all rounded-lg',
                  view === mode
                    ? 'bg-[#5B9BF0] text-white shadow-[0_2px_8px_rgba(91,155,240,0.3)]'
                    : 'text-muted hover:text-foreground',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => { setEditingTask(null); setDialogOpen(true); }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B9BF0] to-[#3D6FBF] px-5 py-2 text-sm font-medium text-white shadow-[0_2px_12px_rgba(91,155,240,0.3)] hover:shadow-[0_4px_20px_rgba(91,155,240,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>

      {view !== 'kanban' && view !== 'calendar' && (
        <div className="mb-4">
          <TaskFilters
            filters={filters}
            onChange={setFilters}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
          />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : view === 'kanban' ? (
        <KanbanBoard tasks={tasks} onTaskClick={setSelectedTask} />
      ) : view === 'calendar' ? (
        <TaskCalendarView tasks={tasks} onTaskClick={setSelectedTask} />
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
          <div className="rounded-2xl bg-card-hover p-4 mb-4">
            <Plus className="h-8 w-8 text-muted" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {view === 'myday' ? 'No tasks added to My Day' : 'No tasks found'}
          </p>
          <p className="mt-1 text-xs text-muted">
            {view === 'myday' ? 'Add tasks to focus on today' : 'Create your first task to get started'}
          </p>
          <button
            onClick={() => { setEditingTask(null); setDialogOpen(true); }}
            className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B9BF0] to-[#3D6FBF] px-5 py-2 text-sm font-medium text-white shadow-[0_2px_12px_rgba(91,155,240,0.3)] hover:shadow-[0_4px_20px_rgba(91,155,240,0.4)] transition-all"
          >
            <Plus className="h-4 w-4" />
            {view === 'myday' ? 'Add to My Day' : 'Create Task'}
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {tasks.map((task, i) => (
              <div key={task.id} className="animate-card-in" style={{ '--i': i } as React.CSSProperties}>
                <TaskItem
                  task={task}
                  onToggleStatus={handleToggleStatus}
                  onToggleMyDay={handleToggleMyDay}
                  onClick={setSelectedTask}
                />
              </div>
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border-hover disabled:opacity-40 transition-all"
              >
                Previous
              </button>
              <span className="text-sm text-muted tabular-nums">
                {page} / {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="rounded-lg border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border-hover disabled:opacity-40 transition-all"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <TaskDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingTask(null); }}
        onSubmit={handleSubmit}
        task={editingTask}
      />

      <TaskDetailPanel
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}
