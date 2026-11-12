import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Circle,
  Flag,
  Link2,
  Milestone as MilestoneIcon,
  Pencil,
  Plus,
  Tag,
  Trash2,
  Unlink,
} from 'lucide-react';
import { isPast, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
  useProject,
  useProjectStats,
  useUpdateProject,
  useDeleteProject,
  useAddMilestone,
  useUpdateMilestone,
  useDeleteMilestone,
  useLinkTask,
  useUnlinkTask,
} from '../hooks/use-projects';
import { useCreateTask, useUpdateTask } from '@/modules/tasks/hooks/use-tasks';
import { TaskDialog } from '@/modules/tasks/components/task-dialog';
import { ProjectDialog } from '../components/project-dialog';
import { MilestoneItem } from '../components/milestone-item';
import { MilestoneDialog } from '../components/milestone-dialog';
import { LinkTaskDialog } from '../components/link-task-dialog';
import type {
  Project,
  ProjectStatus,
  Priority,
  Task,
  Milestone,
  UpdateProjectInput,
  CreateMilestoneInput,
  UpdateMilestoneInput,
  CreateTaskInput,
  UpdateTaskInput,
  MilestoneStatus,
} from '@lifeos/shared';

const statusConfig: Record<ProjectStatus, { text: string; color: string }> = {
  planning: { text: 'Planning', color: 'bg-muted/20 text-muted-foreground' },
  active: { text: 'Active', color: 'bg-primary/15 text-primary' },
  on_hold: { text: 'On Hold', color: 'bg-warning/15 text-warning' },
  completed: { text: 'Completed', color: 'bg-success/15 text-success' },
  archived: { text: 'Archived', color: 'bg-muted/20 text-muted' },
};

const priorityConfig: Record<Priority, { text: string; color: string }> = {
  low: { text: 'Low', color: 'text-muted-foreground' },
  medium: { text: 'Medium', color: 'text-primary' },
  high: { text: 'High', color: 'text-warning' },
  urgent: { text: 'Critical', color: 'text-danger' },
};

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: projectData, isLoading } = useProject(id);
  const { data: statsData } = useProjectStats(id);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const addMilestone = useAddMilestone();
  const updateMilestone = useUpdateMilestone();
  const deleteMilestone = useDeleteMilestone();
  const linkTask = useLinkTask();
  const unlinkTask = useUnlinkTask();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [linkTaskDialogOpen, setLinkTaskDialogOpen] = useState(false);
  const [notesEditing, setNotesEditing] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteMilestoneId, setDeleteMilestoneId] = useState<string | null>(null);
  const [unlinkTaskId, setUnlinkTaskId] = useState<string | null>(null);

  const project = projectData?.data;
  const stats = statsData?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded bg-card animate-pulse" />
        <div className="h-40 rounded-lg bg-card animate-pulse" />
        <div className="h-60 rounded-lg bg-card animate-pulse" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-muted-foreground">Project not found</p>
        <button
          onClick={() => navigate('/projects')}
          className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B9BF0] to-[#3D6FBF] px-5 py-2 text-sm font-medium text-white shadow-[0_2px_12px_rgba(91,155,240,0.3)] hover:shadow-[0_4px_20px_rgba(91,155,240,0.4)] transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </button>
      </div>
    );
  }

  const status = statusConfig[project.status];
  const priorityCfg = priorityConfig[project.priority];
  const progress = stats?.progress ?? 0;
  const isOverdue =
    project.targetEndDate &&
    !['completed', 'archived'].includes(project.status) &&
    isPast(parseISO(project.targetEndDate));

  const handleEdit = (input: UpdateProjectInput & { id: string }) => {
    updateProject.mutate(input, {
      onSuccess: () => setEditDialogOpen(false),
    });
  };

  const handleDelete = () => setDeleteConfirmOpen(true);

  const confirmDelete = () => {
    deleteProject.mutate(project.id, {
      onSuccess: () => navigate('/projects'),
    });
    setDeleteConfirmOpen(false);
  };

  const handleMilestoneSubmit = (
    input: CreateMilestoneInput | (UpdateMilestoneInput & { milestoneId: string }),
  ) => {
    if ('milestoneId' in input) {
      const { milestoneId, ...rest } = input;
      updateMilestone.mutate(
        { projectId: project.id, milestoneId, ...rest },
        { onSuccess: () => { setMilestoneDialogOpen(false); setEditingMilestone(null); } },
      );
    } else {
      addMilestone.mutate(
        { projectId: project.id, ...input },
        { onSuccess: () => setMilestoneDialogOpen(false) },
      );
    }
  };

  const handleMilestoneStatusChange = (milestone: Milestone, newStatus: MilestoneStatus) => {
    updateMilestone.mutate({
      projectId: project.id,
      milestoneId: milestone.id,
      status: newStatus,
    });
  };

  const handleMilestoneDelete = (milestoneId: string) => setDeleteMilestoneId(milestoneId);

  const confirmMilestoneDelete = () => {
    if (deleteMilestoneId) {
      deleteMilestone.mutate({ projectId: project.id, milestoneId: deleteMilestoneId });
    }
    setDeleteMilestoneId(null);
  };

  const handleLinkTask = (taskId: string) => {
    linkTask.mutate({ projectId: project.id, taskId });
  };

  const handleUnlinkTask = (taskId: string) => setUnlinkTaskId(taskId);

  const confirmUnlinkTask = () => {
    if (unlinkTaskId) {
      unlinkTask.mutate({ projectId: project.id, taskId: unlinkTaskId });
    }
    setUnlinkTaskId(null);
  };

  const handleToggleTaskStatus = (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    updateTask.mutate(
      { id: task.id, status: newStatus },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }) },
    );
  };

  const handleSaveNotes = () => {
    updateProject.mutate(
      { id: project.id, notes: notesValue.trim() || null },
      { onSuccess: () => setNotesEditing(false) },
    );
  };

  const startEditNotes = () => {
    setNotesValue(project.notes ?? '');
    setNotesEditing(true);
  };

  const handleCreateTask = (data: CreateTaskInput | (UpdateTaskInput & { id: string })) => {
    if ('id' in data) return;
    createTask.mutate(
      { ...data, projectId: project.id },
      {
        onSuccess: () => {
          setCreateTaskDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
      },
    );
  };

  const linkedTaskIds = project.tasks.map((t: Task) => t.id);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/projects')}
          className="mb-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-4 w-4 rounded-sm shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{project.name}</h1>
            <span className={cn('rounded px-2 py-0.5 text-xs font-medium', status.color)}>
              {status.text}
            </span>
            {isOverdue && (
              <span className="flex items-center gap-1 rounded bg-danger/15 px-2 py-0.5 text-xs font-medium text-danger">
                <AlertTriangle className="h-3 w-3" />
                Overdue
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditDialogOpen(true)}
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-danger transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div className="mb-6 rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
          Overview
        </h2>

        {project.description && (
          <p className="text-sm text-foreground mb-4">{project.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <span className="text-xs text-muted-foreground">Priority</span>
            <p className={cn('mt-0.5 text-sm font-medium flex items-center gap-1', priorityCfg.color)}>
              <Flag className="h-3.5 w-3.5" />
              {priorityCfg.text}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Category</span>
            <p className="mt-0.5 text-sm font-medium text-foreground">{project.category}</p>
          </div>
          {project.startDate && (
            <div>
              <span className="text-xs text-muted-foreground">Start Date</span>
              <p className="mt-0.5 text-sm text-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {format(new Date(project.startDate), 'MMM d, yyyy')}
              </p>
            </div>
          )}
          {project.targetEndDate && (
            <div>
              <span className="text-xs text-muted-foreground">Target End Date</span>
              <p className="mt-0.5 text-sm text-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {format(new Date(project.targetEndDate), 'MMM d, yyyy')}
              </p>
            </div>
          )}
        </div>

        {project.tags.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-card-hover px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {stats && (stats.totalTasks > 0 || stats.totalMilestones > 0) && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">{progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-border">
              <div
                className="h-2 rounded-full bg-primary animate-progress"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                Tasks: {stats.completedTasks}/{stats.totalTasks}
              </span>
              <span>
                Milestones: {stats.completedMilestones}/{stats.totalMilestones}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Milestones Section */}
      <div className="mb-6 rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted flex items-center gap-2">
            <MilestoneIcon className="h-4 w-4" />
            Milestones
          </h2>
          <button
            onClick={() => {
              setEditingMilestone(null);
              setMilestoneDialogOpen(true);
            }}
            className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Milestone
          </button>
        </div>

        {project.milestones.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No milestones yet. Add milestones to track key deliverables.
          </p>
        ) : (
          <div className="space-y-2">
            {project.milestones.map((milestone: Milestone) => (
              <MilestoneItem
                key={milestone.id}
                milestone={milestone}
                onStatusChange={(status) =>
                  handleMilestoneStatusChange(milestone, status)
                }
                onEdit={() => {
                  setEditingMilestone(milestone);
                  setMilestoneDialogOpen(true);
                }}
                onDelete={() => handleMilestoneDelete(milestone.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tasks Section */}
      <div className="mb-6 rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Tasks ({project.tasks.length})
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCreateTaskDialogOpen(true)}
              className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              New Task
            </button>
            <button
              onClick={() => setLinkTaskDialogOpen(true)}
              className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Link2 className="h-3.5 w-3.5" />
              Link Task
            </button>
          </div>
        </div>

        {project.tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No tasks yet. Create a new task or link an existing one.
          </p>
        ) : (
          <div className="space-y-1">
            {project.tasks.map((task: Task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-md p-2.5 transition-colors hover:bg-card-hover group"
              >
                <button
                  onClick={() => handleToggleTaskStatus(task)}
                  className="shrink-0 transition-colors"
                  title={task.status === 'done' ? 'Mark as todo' : 'Mark as done'}
                >
                  {task.status === 'done' ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  )}
                </button>
                <button
                  onClick={() => navigate(`/tasks?taskId=${task.id}`)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p
                    className={cn(
                      'text-sm truncate',
                      task.status === 'done'
                        ? 'text-muted-foreground line-through'
                        : 'text-foreground',
                    )}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span className={cn(priorityConfig[task.priority].color)}>
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(task.dueDate), 'MMM d')}
                      </span>
                    )}
                    <span>{task.status.replace('_', ' ')}</span>
                  </div>
                </button>
                <button
                  onClick={() => handleUnlinkTask(task.id)}
                  className="shrink-0 rounded p-1 text-muted-foreground hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                  title="Unlink task"
                >
                  <Unlink className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div className="mb-6 rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Notes
          </h2>
          {!notesEditing && (
            <button
              onClick={startEditNotes}
              className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil className="h-3 w-3" />
              {project.notes ? 'Edit' : 'Add Notes'}
            </button>
          )}
        </div>

        {notesEditing ? (
          <div>
            <textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              rows={6}
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Project notes..."
              autoFocus
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                onClick={() => setNotesEditing(false)}
                className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        ) : project.notes ? (
          <p className="text-sm text-foreground whitespace-pre-wrap">{project.notes}</p>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No notes yet.
          </p>
        )}
      </div>

      {/* Dialogs */}
      <ProjectDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSubmit={(input) => {
          if ('id' in input) handleEdit(input);
        }}
        project={project}
      />

      <MilestoneDialog
        open={milestoneDialogOpen}
        onClose={() => {
          setMilestoneDialogOpen(false);
          setEditingMilestone(null);
        }}
        onSubmit={handleMilestoneSubmit}
        milestone={editingMilestone}
      />

      <LinkTaskDialog
        open={linkTaskDialogOpen}
        onClose={() => setLinkTaskDialogOpen(false)}
        onLink={handleLinkTask}
        linkedTaskIds={linkedTaskIds}
      />

      <TaskDialog
        open={createTaskDialogOpen}
        onClose={() => setCreateTaskDialogOpen(false)}
        onSubmit={handleCreateTask}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Project"
        description="This will permanently delete this project and all its milestones. Linked tasks will be unlinked but not deleted."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteMilestoneId}
        title="Delete Milestone"
        description="This milestone will be permanently removed from the project."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmMilestoneDelete}
        onCancel={() => setDeleteMilestoneId(null)}
      />

      <ConfirmDialog
        open={!!unlinkTaskId}
        title="Unlink Task"
        description="This task will be removed from the project but won't be deleted. You can link it again later."
        confirmLabel="Unlink"
        variant="warning"
        icon={Unlink}
        onConfirm={confirmUnlinkTask}
        onCancel={() => setUnlinkTaskId(null)}
      />
    </div>
  );
}
