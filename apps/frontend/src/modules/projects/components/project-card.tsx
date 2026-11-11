import { format } from 'date-fns';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectStatus, Priority } from '@lifeos/shared';
import type { ProjectListItem } from '../hooks/use-projects';

interface ProjectCardProps {
  project: ProjectListItem;
  onClick: (project: ProjectListItem) => void;
}

const statusConfig: Record<ProjectStatus, { text: string; color: string }> = {
  planning: { text: 'Planning', color: 'bg-muted/20 text-muted-foreground' },
  active: { text: 'Active', color: 'bg-primary/15 text-primary' },
  on_hold: { text: 'On Hold', color: 'bg-warning/15 text-warning' },
  completed: { text: 'Completed', color: 'bg-success/15 text-success' },
  archived: { text: 'Archived', color: 'bg-muted/20 text-muted' },
};

const priorityConfig: Record<Priority, { text: string; color: string }> = {
  low: { text: 'Low', color: 'bg-muted/20 text-muted-foreground' },
  medium: { text: 'Medium', color: 'bg-primary/15 text-primary' },
  high: { text: 'High', color: 'bg-warning/15 text-warning' },
  urgent: { text: 'Critical', color: 'bg-danger/15 text-danger' },
};

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const status = statusConfig[project.status];
  const priority = priorityConfig[project.priority];
  const { totalTasks, completedTasks } = project.taskStats;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <button
      onClick={() => onClick(project)}
      className="w-full text-left rounded-lg border border-border bg-card p-4 transition-colors hover:bg-card-hover"
    >
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 h-3 w-3 shrink-0 rounded-sm"
          style={{ backgroundColor: project.color }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium text-foreground truncate">{project.name}</h3>
            <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-xs font-medium', status.color)}>
              {status.text}
            </span>
          </div>

          {project.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{project.description}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={cn('rounded px-1.5 py-0.5 text-xs font-medium', priority.color)}>
              {priority.text}
            </span>
            <span className="rounded bg-card-hover px-1.5 py-0.5 text-xs text-muted-foreground">
              {project.category}
            </span>
          </div>

          {totalTasks > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>
                    {completedTasks}/{totalTasks} tasks
                  </span>
                </div>
                <span>{progressPct}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-border">
                <div
                  className="h-1.5 rounded-full bg-primary animate-progress"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {project.targetEndDate && (
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Due {format(new Date(project.targetEndDate), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
