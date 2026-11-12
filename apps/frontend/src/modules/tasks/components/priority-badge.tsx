import { cn } from '@/lib/utils';
import type { Priority } from '@lifeos/shared';

const priorityConfig: Record<Priority, { label: string; className: string; dot: string }> = {
  urgent: { label: 'Urgent', className: 'bg-[#E05A52]/12 text-[#E05A52] ring-[#E05A52]/20', dot: 'bg-[#E05A52]' },
  high: { label: 'High', className: 'bg-[#F5C344]/12 text-[#F5C344] ring-[#F5C344]/20', dot: 'bg-[#F5C344]' },
  medium: { label: 'Medium', className: 'bg-[#5B9BF0]/12 text-[#5B9BF0] ring-[#5B9BF0]/20', dot: 'bg-[#5B9BF0]' },
  low: { label: 'Low', className: 'bg-[#6B6966]/12 text-[#A6A39F] ring-[#6B6966]/20', dot: 'bg-[#6B6966]' },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = priorityConfig[priority];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset', config.className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}
