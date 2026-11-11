import { cn } from '@/lib/utils';
import type { Priority } from '@lifeos/shared';

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  urgent: { label: 'Urgent', className: 'bg-danger/15 text-danger' },
  high: { label: 'High', className: 'bg-danger/15 text-danger' },
  medium: { label: 'Medium', className: 'bg-warning/15 text-warning' },
  low: { label: 'Low', className: 'bg-muted/20 text-muted-foreground' },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = priorityConfig[priority];
  return (
    <span className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium', config.className)}>
      {config.label}
    </span>
  );
}
