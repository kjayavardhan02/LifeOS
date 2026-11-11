import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Milestone, CreateMilestoneInput, UpdateMilestoneInput, MilestoneStatus } from '@lifeos/shared';
import { MILESTONE_STATUSES } from '@lifeos/shared';

const STATUS_LABELS: Record<MilestoneStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

interface MilestoneDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateMilestoneInput | (UpdateMilestoneInput & { milestoneId: string })) => void;
  milestone?: Milestone | null;
}

function toLocalDate(dateStr: string): string {
  const d = new Date(dateStr);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

export function MilestoneDialog({ open, onClose, onSubmit, milestone }: MilestoneDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState<MilestoneStatus>('pending');

  useEffect(() => {
    if (milestone) {
      setTitle(milestone.title);
      setDescription(milestone.description ?? '');
      setTargetDate(milestone.targetDate ? toLocalDate(milestone.targetDate) : '');
      setStatus(milestone.status);
    } else {
      setTitle('');
      setDescription('');
      setTargetDate('');
      setStatus('pending');
    }
  }, [milestone, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (milestone) {
      const update: UpdateMilestoneInput & { milestoneId: string } = {
        milestoneId: milestone.id,
        title: title.trim(),
        description: description.trim() || null,
        targetDate: targetDate ? new Date(targetDate + 'T00:00:00').toISOString() : null,
        status,
      };
      onSubmit(update);
    } else {
      const create: CreateMilestoneInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        targetDate: targetDate ? new Date(targetDate + 'T00:00:00').toISOString() : undefined,
      };
      onSubmit(create);
    }
  };

  const inputClass =
    'w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary';
  const selectClass =
    'w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-primary';
  const labelClass = 'block text-xs font-medium text-muted-foreground mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 animate-overlay-in" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-xl animate-dialog-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">
            {milestone ? 'Edit Milestone' : 'New Milestone'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. MVP Launch"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details about this milestone..."
              rows={2}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className={inputClass}
              />
            </div>
            {milestone && (
              <div>
                <label className={labelClass}>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MilestoneStatus)}
                  className={selectClass}
                >
                  {MILESTONE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
            >
              {milestone ? 'Save Changes' : 'Add Milestone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
