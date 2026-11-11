import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { PROJECT_STATUSES, PRIORITIES, PROJECT_COLORS } from '@lifeos/shared';
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectStatus,
  Priority,
} from '@lifeos/shared';
import { useCategoryNames } from '@/hooks/use-categories';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: 'Planning',
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
  archived: 'Archived',
};

const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Critical',
};

interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateProjectInput | (UpdateProjectInput & { id: string })) => void;
  project?: Project | null;
}

function toLocalDate(dateStr: string): string {
  const d = new Date(dateStr);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

export function ProjectDialog({ open, onClose, onSubmit, project }: ProjectDialogProps) {
  const projectCategories = useCategoryNames('project');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('planning');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('Personal');
  const [color, setColor] = useState('#4E85DE');
  const [startDate, setStartDate] = useState('');
  const [targetEndDate, setTargetEndDate] = useState('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description ?? '');
      setStatus(project.status);
      setPriority(project.priority);
      setCategory(project.category);
      setColor(project.color);
      setStartDate(project.startDate ? toLocalDate(project.startDate) : '');
      setTargetEndDate(project.targetEndDate ? toLocalDate(project.targetEndDate) : '');
      setTags(project.tags.join(', '));
      setNotes(project.notes ?? '');
    } else {
      setName('');
      setDescription('');
      setStatus('planning');
      setPriority('medium');
      setCategory('Personal');
      setColor('#4E85DE');
      setStartDate('');
      setTargetEndDate('');
      setTags('');
      setNotes('');
    }
  }, [project, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const base: CreateProjectInput = {
      name: name.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      category,
      color,
      tags: tagList.length > 0 ? tagList : undefined,
      startDate: startDate ? new Date(startDate + 'T00:00:00').toISOString() : undefined,
      targetEndDate: targetEndDate
        ? new Date(targetEndDate + 'T00:00:00').toISOString()
        : undefined,
      notes: notes.trim() || undefined,
    };

    if (project) {
      const update: UpdateProjectInput & { id: string } = {
        id: project.id,
        ...base,
        description: description.trim() || null,
        startDate: startDate ? new Date(startDate + 'T00:00:00').toISOString() : null,
        targetEndDate: targetEndDate
          ? new Date(targetEndDate + 'T00:00:00').toISOString()
          : null,
        notes: notes.trim() || null,
        tags: tagList,
      };
      onSubmit(update);
    } else {
      onSubmit(base);
    }
  };

  const inputClass =
    'w-full rounded-md border border-border bg-input px-3 py-1.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary';
  const labelClass = 'block text-xs font-medium text-muted-foreground mb-1';

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 animate-overlay-in" onClick={onClose} />
      <div className="absolute inset-0 overflow-hidden flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full max-w-lg rounded-lg border border-border bg-card shadow-2xl flex flex-col overflow-hidden animate-dialog-in pointer-events-auto" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
          <div className="shrink-0 flex items-center justify-between border-b border-border bg-card px-4 py-2.5 rounded-t-lg">
            <h2 className="text-base font-semibold text-foreground">
              {project ? 'Edit Project' : 'New Project'}
            </h2>
            <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="px-4 py-3 space-y-2.5 overflow-y-auto flex-1 min-h-0 overscroll-contain">
              <div>
                <label className={labelClass}>Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Website Redesign" className={inputClass} autoFocus required />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this project about?" rows={1} className={inputClass + ' resize-none'} />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={labelClass}>Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)} className={inputClass}>
                    {PROJECT_STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={inputClass}>
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                    {projectCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Target End</label>
                  <input type="date" value={targetEndDate} onChange={(e) => setTargetEndDate(e.target.value)} className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Color</label>
                <div className="flex flex-wrap gap-1.5">
                  {PROJECT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        'h-6 w-6 rounded-md border-2 transition-colors',
                        color === c ? 'border-foreground' : 'border-transparent',
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Tags</label>
                <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="frontend, design, urgent" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." rows={1} className={inputClass + ' resize-none'} />
              </div>
            </div>

            <div className="shrink-0 flex justify-end gap-3 px-4 py-2.5 border-t border-border rounded-b-lg">
              <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
              <button type="submit" className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors">
                {project ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
