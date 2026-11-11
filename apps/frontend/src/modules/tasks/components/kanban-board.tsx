import { Circle, CheckCircle2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriorityBadge } from './priority-badge';
import type { Task, TaskStatus } from '@lifeos/shared';
import { useUpdateTask } from '../hooks/use-tasks';

const columns: { status: TaskStatus; label: string; accent: string }[] = [
  { status: 'todo', label: 'To Do', accent: 'border-t-muted-foreground' },
  { status: 'in_progress', label: 'In Progress', accent: 'border-t-primary' },
  { status: 'done', label: 'Done', accent: 'border-t-success' },
  { status: 'cancelled', label: 'Cancelled', accent: 'border-t-danger' },
];

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function KanbanBoard({ tasks, onTaskClick }: KanbanBoardProps) {
  const updateTask = useUpdateTask();

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      updateTask.mutate({ id: taskId, status: targetStatus });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status);
        return (
          <div
            key={col.status}
            className={cn('rounded-lg border border-border bg-background border-t-2', col.accent)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.status)}
          >
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">{col.label}</h3>
                <span className="rounded-full bg-card-hover px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {columnTasks.length}
                </span>
              </div>
            </div>
            <div className="p-2 space-y-2 min-h-[200px]">
              {columnTasks.map((task) => (
                <KanbanCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
              ))}
              {columnTasks.length === 0 && (
                <div className="flex items-center justify-center py-8 text-xs text-muted">
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const isDone = task.status === 'done' || task.status === 'cancelled';
  const completedSubtasks = task.subtasks.filter((s) => s.isCompleted).length;

  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
      onClick={onClick}
      className="cursor-pointer rounded-md border border-border bg-card p-3 transition-colors hover:border-border-hover"
    >
      <div className="flex items-start gap-2">
        {isDone ? (
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-success" />
        ) : (
          <Circle className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
        )}
        <span className={cn('text-sm font-medium text-foreground', isDone && 'line-through text-muted-foreground')}>
          {task.title}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <PriorityBadge priority={task.priority} />
        {task.subtasks.length > 0 && (
          <span className="text-xs text-muted-foreground">{completedSubtasks}/{task.subtasks.length}</span>
        )}
      </div>
    </div>
  );
}
