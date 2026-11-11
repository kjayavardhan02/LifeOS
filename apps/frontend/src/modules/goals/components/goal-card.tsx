import { Target, Calendar, Milestone } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GoalListItem } from '../hooks/use-goals';

const statusColors: Record<string, string> = {
  not_started: 'text-muted-foreground',
  in_progress: 'text-primary',
  completed: 'text-success',
  abandoned: 'text-danger',
};

const statusLabels: Record<string, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  abandoned: 'Abandoned',
};

const priorityColors: Record<string, string> = {
  low: 'text-muted-foreground',
  medium: 'text-primary',
  high: 'text-warning',
  urgent: 'text-danger',
};

interface GoalCardProps {
  goal: GoalListItem;
  onClick: (goal: GoalListItem) => void;
}

export function GoalCard({ goal, onClick }: GoalCardProps) {
  const progressColor = goal.progress >= 100 ? 'bg-success' : goal.progress > 50 ? 'bg-primary' : 'bg-warning';

  return (
    <button
      onClick={() => onClick(goal)}
      className="w-full rounded-lg border border-border bg-card p-5 text-left transition-all hover:border-border-hover hover:bg-card-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-xs font-medium', statusColors[goal.status])}>
              {statusLabels[goal.status]}
            </span>
            <span className="text-xs text-muted">·</span>
            <span className={cn('text-xs', priorityColors[goal.priority])}>
              {goal.priority}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-foreground truncate">{goal.title}</h3>
          {goal.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{goal.description}</p>
          )}
        </div>
        <Target className="h-5 w-5 shrink-0 text-muted" />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">Progress</span>
          <span className="text-xs font-medium text-foreground">{goal.progress}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-border">
          <div
            className={cn('h-full rounded-full transition-all', progressColor)}
            style={{ width: `${Math.min(goal.progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        {goal.targetDate && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(goal.targetDate).toLocaleDateString()}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Milestone className="h-3 w-3" />
          {goal._count?.milestones ?? 0} milestones
        </span>
        <span className="text-muted">
          {goal._count?.linkedTasks ?? 0} tasks
        </span>
      </div>
    </button>
  );
}
