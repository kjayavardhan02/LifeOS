import { format } from 'date-fns';
import { Calendar, CheckCircle2, Circle, Clock, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Milestone, MilestoneStatus } from '@lifeos/shared';

interface MilestoneItemProps {
  milestone: Milestone;
  onStatusChange: (status: MilestoneStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const statusConfig: Record<MilestoneStatus, { text: string; icon: typeof CheckCircle2; color: string }> = {
  pending: { text: 'Pending', icon: Circle, color: 'text-muted-foreground' },
  in_progress: { text: 'In Progress', icon: Clock, color: 'text-primary' },
  completed: { text: 'Completed', icon: CheckCircle2, color: 'text-success' },
};

const nextStatus: Record<MilestoneStatus, MilestoneStatus> = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'pending',
};

export function MilestoneItem({ milestone, onStatusChange, onEdit, onDelete }: MilestoneItemProps) {
  const config = statusConfig[milestone.status];
  const StatusIcon = config.icon;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-card-hover">
      <button
        onClick={() => onStatusChange(nextStatus[milestone.status])}
        className={cn('mt-0.5 shrink-0 transition-colors', config.color)}
        title={`Status: ${config.text} (click to change)`}
      >
        <StatusIcon className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <h4
          className={cn(
            'text-sm font-medium',
            milestone.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground',
          )}
        >
          {milestone.title}
        </h4>

        {milestone.description && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{milestone.description}</p>
        )}

        <div className="mt-1.5 flex items-center gap-3">
          <span className={cn('text-xs font-medium', config.color)}>{config.text}</span>
          {milestone.targetDate && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {format(new Date(milestone.targetDate), 'MMM d, yyyy')}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={onEdit}
          className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="rounded p-1 text-muted-foreground hover:text-danger transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
