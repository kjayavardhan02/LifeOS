import { cn } from '@/lib/utils';
import type { TaskStatus } from '@lifeos/shared';

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  todo: { label: 'To Do', className: 'bg-[#6B6966]/12 text-[#A6A39F] ring-[#6B6966]/20' },
  in_progress: { label: 'In Progress', className: 'bg-[#5B9BF0]/12 text-[#5B9BF0] ring-[#5B9BF0]/20' },
  done: { label: 'Done', className: 'bg-[#2BD47D]/12 text-[#2BD47D] ring-[#2BD47D]/20' },
  cancelled: { label: 'Cancelled', className: 'bg-[#E05A52]/12 text-[#E05A52] ring-[#E05A52]/20' },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const config = statusConfig[status];
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset', config.className)}>
      {config.label}
    </span>
  );
}
