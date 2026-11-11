import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Unlink,
  Target,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Link2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { isPast, parseISO } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGoal,
  useUpdateGoal,
  useDeleteGoal,
  useAddGoalMilestone,
  useUpdateGoalMilestone,
  useDeleteGoalMilestone,
  useUnlinkTaskFromGoal,
  useUnlinkHabitFromGoal,
} from '../hooks/use-goals';
import { useUpdateTask } from '@/modules/tasks/hooks/use-tasks';
import { GoalDialog } from '../components/goal-dialog';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { LinkTaskDialog } from '../components/link-task-dialog';
import { LinkHabitDialog } from '../components/link-habit-dialog';
import type { GoalMilestone, CreateGoalMilestoneInput } from '@lifeos/shared';

const statusColors: Record<string, string> = {
  not_started: 'bg-muted-foreground/20 text-muted-foreground',
  in_progress: 'bg-primary/20 text-primary',
  completed: 'bg-success/20 text-success',
  abandoned: 'bg-danger/20 text-danger',
};

const statusLabels: Record<string, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  abandoned: 'Abandoned',
};

const milestoneStatusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: Circle,
  in_progress: Clock,
  completed: CheckCircle2,
};

export function GoalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useGoal(id);
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const addMilestone = useAddGoalMilestone();
  const updateMilestone = useUpdateGoalMilestone();
  const deleteMilestone = useDeleteGoalMilestone();
  const unlinkTask = useUnlinkTaskFromGoal();
  const unlinkHabit = useUnlinkHabitFromGoal();
  const updateTask = useUpdateTask();
  const queryClient = useQueryClient();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteMilestoneId, setDeleteMilestoneId] = useState<string | null>(null);
  const [unlinkTaskId, setUnlinkTaskId] = useState<string | null>(null);
  const [unlinkHabitId, setUnlinkHabitId] = useState<string | null>(null);
  const [linkTaskOpen, setLinkTaskOpen] = useState(false);
  const [linkHabitOpen, setLinkHabitOpen] = useState(false);
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');

  const goal = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded bg-card-hover animate-pulse" />
        <div className="h-40 rounded-lg bg-card-hover animate-pulse" />
        <div className="h-60 rounded-lg bg-card-hover animate-pulse" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Target className="h-10 w-10 text-muted" />
        <p className="mt-3 text-sm text-muted-foreground">Goal not found</p>
        <button onClick={() => navigate('/goals')} className="mt-4 text-sm text-primary hover:text-primary-hover">
          Back to goals
        </button>
      </div>
    );
  }

  const isOverdue = goal.targetDate && isPast(parseISO(goal.targetDate)) && goal.status !== 'completed';
  const progressColor = goal.progress >= 100 ? 'bg-success' : goal.progress > 50 ? 'bg-primary' : 'bg-warning';
  const linkedTaskIds = goal.linkedTasks?.map((lt) => lt.taskId) ?? [];

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    const input: CreateGoalMilestoneInput & { goalId: string } = {
      goalId: goal.id,
      title: newMilestoneTitle,
      targetDate: newMilestoneDate ? new Date(newMilestoneDate).toISOString() : undefined,
    };
    addMilestone.mutate(input, {
      onSuccess: () => {
        setNewMilestoneTitle('');
        setNewMilestoneDate('');
        setAddingMilestone(false);
      },
    });
  };

  const cycleMilestoneStatus = (milestone: GoalMilestone) => {
    const statusCycle = ['pending', 'in_progress', 'completed'] as const;
    const currentIdx = statusCycle.indexOf(milestone.status as typeof statusCycle[number]);
    const nextStatus = statusCycle[(currentIdx + 1) % 3]!;
    updateMilestone.mutate({
      goalId: goal.id,
      milestoneId: milestone.id,
      status: nextStatus,
    });
  };

  const handleToggleTask = (task: { id: string; status: string }) => {
    updateTask.mutate(
      { id: task.id, status: task.status === 'done' ? 'todo' : 'done' },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }) },
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/goals')}
          className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to goals
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', statusColors[goal.status])}>
                {statusLabels[goal.status]}
              </span>
              <span className="text-xs text-muted-foreground">{goal.type === 'long_term' ? 'Long Term' : 'Short Term'}</span>
              {isOverdue && (
                <span className="flex items-center gap-1 rounded-full bg-danger/20 px-2 py-0.5 text-xs font-medium text-danger">
                  <AlertTriangle className="h-3 w-3" /> Overdue
                </span>
              )}
            </div>
            <h1 className="text-xl font-semibold text-foreground">{goal.title}</h1>
            {goal.description && (
              <p className="mt-1 text-sm text-muted-foreground">{goal.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditDialogOpen(true)}
              className="rounded-md border border-border p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="rounded-md border border-border p-2 text-muted-foreground hover:text-danger transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Progress</span>
            <span className="text-sm font-bold text-foreground">{goal.progress}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-border">
            <div
              className={cn('h-full rounded-full transition-all', progressColor)}
              style={{ width: `${Math.min(goal.progress, 100)}%` }}
            />
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            {goal.targetDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Target: {new Date(goal.targetDate).toLocaleDateString()}
              </span>
            )}
            <span>{goal.category}</span>
            <span>{goal.priority} priority</span>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="mb-6 rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Milestones</h2>
          <button
            onClick={() => setAddingMilestone(true)}
            className="flex items-center gap-1.5 rounded-md border border-primary px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add Milestone
          </button>
        </div>

        {addingMilestone && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-card-hover p-3">
            <input
              type="text"
              value={newMilestoneTitle}
              onChange={(e) => setNewMilestoneTitle(e.target.value)}
              placeholder="Milestone title..."
              className="h-8 flex-1 rounded-md border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddMilestone()}
            />
            <input
              type="date"
              value={newMilestoneDate}
              onChange={(e) => setNewMilestoneDate(e.target.value)}
              className="h-8 rounded-md border border-border bg-input px-2 text-sm text-foreground outline-none focus:border-primary"
            />
            <button onClick={handleAddMilestone} className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-hover">
              Add
            </button>
            <button onClick={() => setAddingMilestone(false)} className="text-xs text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          </div>
        )}

        {goal.milestones.length === 0 ? (
          <p className="text-sm text-muted-foreground">No milestones yet</p>
        ) : (
          <div className="space-y-2">
            {goal.milestones.map((milestone) => {
              const StatusIcon = milestoneStatusIcons[milestone.status] ?? Circle;
              return (
                <div key={milestone.id} className="group flex items-center gap-3 rounded-md p-2 hover:bg-card-hover transition-colors">
                  <button onClick={() => cycleMilestoneStatus(milestone)}>
                    <StatusIcon className={cn(
                      'h-5 w-5',
                      milestone.status === 'completed' ? 'text-success' : milestone.status === 'in_progress' ? 'text-primary' : 'text-muted-foreground',
                    )} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm', milestone.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground')}>
                      {milestone.title}
                    </p>
                    {milestone.targetDate && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(milestone.targetDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setDeleteMilestoneId(milestone.id)}
                    className="rounded-md p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-danger transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Linked Tasks */}
      <div className="mb-6 rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Tasks ({goal.linkedTasks?.length ?? 0})
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setLinkTaskOpen(true)}
              className="flex items-center gap-1.5 rounded-md border border-primary px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Link2 className="h-3 w-3" />
              Link Task
            </button>
          </div>
        </div>

        {!goal.linkedTasks || goal.linkedTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks linked yet</p>
        ) : (
          <div className="space-y-1.5">
            {goal.linkedTasks.map((lt) => {
              const task = lt.task;
              return (
                <div key={task.id} className="group flex items-center gap-3 rounded-md p-2 hover:bg-card-hover transition-colors">
                  <button onClick={() => handleToggleTask(task)}>
                    {task.status === 'done' ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  <button
                    onClick={() => navigate(`/tasks?taskId=${task.id}`)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className={cn('text-sm', task.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground')}>
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{task.priority} · {task.status}</p>
                  </button>
                  <button
                    onClick={() => setUnlinkTaskId(task.id)}
                    className="rounded-md p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-warning transition-all"
                  >
                    <Unlink className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Linked Habits */}
      <div className="mb-6 rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Habits ({goal.linkedHabits?.length ?? 0})
          </h2>
          <button
            onClick={() => setLinkHabitOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-primary px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Link2 className="h-3 w-3" />
            Link Habit
          </button>
        </div>

        {!goal.linkedHabits || goal.linkedHabits.length === 0 ? (
          <p className="text-sm text-muted-foreground">No habits linked yet</p>
        ) : (
          <div className="space-y-1.5">
            {goal.linkedHabits.map((lh) => {
              const habit = lh.habit;
              return (
                <div key={habit.id} className="group flex items-center gap-3 rounded-md p-2 hover:bg-card-hover transition-colors">
                  <div className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: habit.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{habit.name}</p>
                    <p className="text-xs text-muted-foreground">{habit.frequency} · streak: {habit.streakCurrent}</p>
                  </div>
                  <button
                    onClick={() => setUnlinkHabitId(habit.id)}
                    className="rounded-md p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-warning transition-all"
                  >
                    <Unlink className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notes */}
      {goal.notes && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Notes</h2>
          <p className="text-sm text-foreground whitespace-pre-wrap">{goal.notes}</p>
        </div>
      )}

      {/* Dialogs */}
      <GoalDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSubmit={(input) => {
          if ('id' in input) {
            const { id: goalId, ...rest } = input;
            updateGoal.mutate({ ...rest, id: goalId }, { onSuccess: () => setEditDialogOpen(false) });
          }
        }}
        initialData={{
          id: goal.id,
          title: goal.title,
          description: goal.description,
          type: goal.type,
          status: goal.status,
          priority: goal.priority,
          category: goal.category,
          tags: goal.tags,
          targetDate: goal.targetDate,
          progressMode: goal.progressMode,
          notes: goal.notes,
        }}
      />

      <LinkTaskDialog
        open={linkTaskOpen}
        onClose={() => setLinkTaskOpen(false)}
        linkedTaskIds={linkedTaskIds}
        goalId={goal.id}
      />

      <LinkHabitDialog
        open={linkHabitOpen}
        onClose={() => setLinkHabitOpen(false)}
        linkedHabitIds={goal.linkedHabits?.map((lh) => lh.habit.id) ?? []}
        goalId={goal.id}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Goal"
        description="This goal and all its milestones will be permanently deleted. Linked tasks and habits won't be affected."
        variant="danger"
        confirmLabel="Delete"
        onConfirm={() => {
          deleteGoal.mutate(goal.id, { onSuccess: () => navigate('/goals') });
          setDeleteConfirmOpen(false);
        }}
        onCancel={() => setDeleteConfirmOpen(false)}
      />

      <ConfirmDialog
        open={deleteMilestoneId !== null}
        title="Delete Milestone"
        description="This milestone will be permanently removed from the goal."
        variant="danger"
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteMilestoneId) {
            deleteMilestone.mutate({ goalId: goal.id, milestoneId: deleteMilestoneId });
          }
          setDeleteMilestoneId(null);
        }}
        onCancel={() => setDeleteMilestoneId(null)}
      />

      <ConfirmDialog
        open={unlinkTaskId !== null}
        title="Unlink Task"
        description="This task will be removed from the goal but won't be deleted."
        variant="warning"
        icon={Unlink}
        confirmLabel="Unlink"
        onConfirm={() => {
          if (unlinkTaskId) {
            unlinkTask.mutate({ goalId: goal.id, taskId: unlinkTaskId });
          }
          setUnlinkTaskId(null);
        }}
        onCancel={() => setUnlinkTaskId(null)}
      />

      <ConfirmDialog
        open={unlinkHabitId !== null}
        title="Unlink Habit"
        description="This habit will be removed from the goal but won't be deleted."
        variant="warning"
        icon={Unlink}
        confirmLabel="Unlink"
        onConfirm={() => {
          if (unlinkHabitId) {
            unlinkHabit.mutate({ goalId: goal.id, habitId: unlinkHabitId });
          }
          setUnlinkHabitId(null);
        }}
        onCancel={() => setUnlinkHabitId(null)}
      />
    </div>
  );
}
