import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { CreateGoalInput, UpdateGoalInput, GoalType, GoalStatus, Priority } from '@lifeos/shared';

interface GoalDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateGoalInput | (UpdateGoalInput & { id: string })) => void;
  initialData?: {
    id: string;
    title: string;
    description: string | null;
    type: GoalType;
    status: GoalStatus;
    priority: Priority;
    category: string;
    tags: string[];
    targetDate: string | null;
    progressMode: string;
    notes: string | null;
  };
}

const goalTypes: { value: GoalType; label: string }[] = [
  { value: 'short_term', label: 'Short Term' },
  { value: 'long_term', label: 'Long Term' },
];

const goalStatuses: { value: GoalStatus; label: string }[] = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'abandoned', label: 'Abandoned' },
];

const priorities: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const categories = ['Personal', 'Career', 'Health', 'Finance', 'Learning', 'Relationships', 'Creative', 'Other'];

export function GoalDialog({ open, onClose, onSubmit, initialData }: GoalDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<GoalType>('short_term');
  const [status, setStatus] = useState<GoalStatus>('not_started');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('Personal');
  const [targetDate, setTargetDate] = useState('');
  const [progressMode, setProgressMode] = useState('auto');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description ?? '');
      setType(initialData.type);
      setStatus(initialData.status);
      setPriority(initialData.priority);
      setCategory(initialData.category);
      setTargetDate(initialData.targetDate ? initialData.targetDate.slice(0, 10) : '');
      setProgressMode(initialData.progressMode);
    } else {
      setTitle('');
      setDescription('');
      setType('short_term');
      setStatus('not_started');
      setPriority('medium');
      setCategory('Personal');
      setTargetDate('');
      setProgressMode('auto');
    }
  }, [initialData, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = {
      title,
      description: description || undefined,
      type,
      status,
      priority,
      category,
      targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
      progressMode,
    };

    if (initialData) {
      onSubmit({ ...input, id: initialData.id });
    } else {
      onSubmit(input);
    }
  };

  const selectClass = 'h-9 w-full rounded-md border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none';
  const inputClass = 'h-9 w-full rounded-md border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 animate-overlay-in" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-hidden rounded-lg border border-border bg-card shadow-xl flex flex-col animate-dialog-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {initialData ? 'Edit Goal' : 'New Goal'}
          </h2>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="What do you want to achieve?"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
              rows={3}
              placeholder="Describe your goal..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as GoalType)} className={selectClass}>
                {goalTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as GoalStatus)} className={selectClass}>
                {goalStatuses.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={selectClass}>
                {priorities.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Progress Mode</label>
              <select value={progressMode} onChange={(e) => setProgressMode(e.target.value)} className={selectClass}>
                <option value="auto">Auto (from milestones & tasks)</option>
                <option value="manual">Manual</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {initialData ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
