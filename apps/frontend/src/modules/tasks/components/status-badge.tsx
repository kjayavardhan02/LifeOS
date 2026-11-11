import { cn } from '@/lib/utils';
import type { TaskStatus } from '@lifeos/shared';

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  todo: { label: 'To Do', className: 'bg-muted/20 text-muted-foreground' },
  in_progress: { label: 'In Progress', className: 'bg-primary/15 text-primary' },
  done: { label: 'Done', className: 'bg-success/15 text-success' },
  cancelled: { label: 'Cancelled', className: 'bg-danger/15 text-danger' },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const config = statusConfig[status];
  return (
    <span className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium', config.className)}>
      {config.label}
    </span>
  );
}
