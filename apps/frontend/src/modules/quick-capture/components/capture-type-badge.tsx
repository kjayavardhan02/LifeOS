import { CheckSquare, IndianRupee, StickyNote, Bell, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuickCaptureType } from '@lifeos/shared';

const TYPE_CONFIG: Record<QuickCaptureType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  task: { label: 'Task', icon: CheckSquare, color: 'text-primary', bg: 'bg-primary/10' },
  expense: { label: 'Expense', icon: IndianRupee, color: 'text-warning', bg: 'bg-warning/10' },
  note: { label: 'Note', icon: StickyNote, color: 'text-info', bg: 'bg-info/10' },
  reminder: { label: 'Reminder', icon: Bell, color: 'text-success', bg: 'bg-success/10' },
  event: { label: 'Event', icon: Calendar, color: 'text-chart-5', bg: 'bg-chart-5/10' },
};

interface CaptureTypeBadgeProps {
  type: QuickCaptureType;
  size?: 'sm' | 'md';
  className?: string;
}

export function CaptureTypeBadge({ type, size = 'sm', className }: CaptureTypeBadgeProps) {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        config.color,
        config.bg,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        className,
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {config.label}
    </span>
  );
}

export { TYPE_CONFIG };
