import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { X, Edit2, Trash2, Calendar, CheckCircle2, Tag, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpdateProject, useDeleteProject } from '../hooks/use-projects';
import type { Project, ProjectStatus, Priority } from '@lifeos/shared';

interface ProjectDetailPanelProps {
  project: Project | null;
  onClose: () => void;
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

export function ProjectDetailPanel({ project, onClose }: ProjectDetailPanelProps) {
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<ProjectStatus>('planning');
  const [editPriority, setEditPriority] = useState<Priority>('medium');
  const [editCategory, setEditCategory] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editColor, setEditColor] = useState('#4E85DE');
  const [editStartDate, setEditStartDate] = useState('');
  const [editTargetEndDate, setEditTargetEndDate] = useState('');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    if (project) {
      setEditName(project.name);
      setEditDescription(project.description ?? '');
      setEditStatus(project.status);
      setEditPriority(project.priority);
      setEditCategory(project.category);
      setEditTags(project.tags.join(', '));
      setEditColor(project.color);
      setEditStartDate(project.startDate?.slice(0, 10) ?? '');
      setEditTargetEndDate(project.targetEndDate?.slice(0, 10) ?? '');
      setEditNotes(project.notes ?? '');
      setIsEditing(false);
    }
  }, [project]);

  if (!project) return null;

  const status = statusConfig[project.status];
  const priority = priorityConfig[project.priority];
  const totalTasks = project.tasks?.length ?? project._count?.tasks ?? 0;
  const completedTasks = project.tasks?.filter((t) => t.status === 'done').length ?? 0;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleDelete = () => {
    deleteProject.mutate(project.id);
    onClose();
  };

  const handleSave = () => {
    if (!editName.trim()) return;
    const tagList = editTags.split(',').map((t) => t.trim()).filter(Boolean);
    updateProject.mutate(
      {
        id: project.id,
        name: editName.trim(),
        description: editDescription || null,
        status: editStatus,
        priority: editPriority,
        category: editCategory,
        tags: tagList,
        color: editColor,
        startDate: editStartDate || null,
        targetEndDate: editTargetEndDate || null,
        notes: editNotes || null,
      },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  const inputClass =
    'w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary';

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 animate-overlay-in" onClick={onClose} />
      <div className="absolute inset-0 overflow-hidden flex items-center justify-center p-6 pointer-events-none">
        <div className="relative w-full max-w-2xl rounded-lg border border-border bg-card shadow-2xl flex flex-col animate-dialog-in pointer-events-auto" style={{ maxHeight: 'calc(100vh - 3rem)' }}>
          <div className="shrink-0 flex items-center justify-between border-b border-border bg-card px-5 py-4 rounded-t-lg">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: project.color }} />
              <h2 className="text-base font-semibold text-foreground truncate">{project.name}</h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                title="Edit project"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-5 overflow-y-auto flex-1 min-h-0 overscroll-contain">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Name</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Description</label>
                  <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} className={inputClass + ' resize-none'} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Status</label>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as ProjectStatus)} className={inputClass}>
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="on_hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Priority</label>
                    <select value={editPriority} onChange={(e) => setEditPriority(e.target.value as Priority)} className={inputClass}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Category</label>
                    <input type="text" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Color</label>
                    <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} className={inputClass + ' h-10 cursor-pointer'} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Tags</label>
                  <input type="text" value={editTags} onChange={(e) => setEditTags(e.target.value)} className={inputClass} placeholder="tag1, tag2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Start Date</label>
                    <input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Target End Date</label>
                    <input type="date" value={editTargetEndDate} onChange={(e) => setEditTargetEndDate(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Notes</label>
                  <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} className={inputClass + ' resize-none'} />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={!editName.trim()}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Status & Priority badges */}
                <div className="flex flex-wrap gap-2">
                  <span className={cn('rounded px-1.5 py-0.5 text-xs font-medium', status.color)}>
                    {status.text}
                  </span>
                  <span className={cn('rounded px-1.5 py-0.5 text-xs font-medium', priority.color)}>
                    {priority.text}
                  </span>
                  <span className="rounded bg-card-hover px-1.5 py-0.5 text-xs text-muted-foreground">
                    {project.category}
                  </span>
                </div>

                {/* Description */}
                {project.description && (
                  <div>
                    <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.description}</p>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  {project.startDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Start: {format(new Date(project.startDate), 'MMM d, yyyy')}
                    </div>
                  )}
                  {project.targetEndDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Target: {format(new Date(project.targetEndDate), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>

                {/* Progress */}
                {totalTasks > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Progress</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{completedTasks}/{totalTasks} tasks</span>
                      </div>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-border">
                      <div className="h-2 rounded-full bg-primary animate-progress" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>
                )}

                {/* Tags */}
                {project.tags.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span key={tag} className="rounded bg-card-hover px-2 py-0.5 text-xs text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {project.notes && (
                  <div>
                    <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Notes</h3>
                    <div className="rounded-md border border-border bg-background p-3">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{project.notes}</p>
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="text-xs text-muted space-y-1">
                  <p>Created {format(new Date(project.createdAt), 'MMM d, yyyy')}</p>
                  <p>Updated {format(new Date(project.updatedAt), 'MMM d, yyyy')}</p>
                </div>
              </>
            )}

            {/* Delete */}
            <div className="pt-4 border-t border-border">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete Project
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
