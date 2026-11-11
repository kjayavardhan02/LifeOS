import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { X, Clock, Repeat, Bell, Mail, Edit2, Trash2, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpdateReminder, useDeleteReminder } from '../hooks/use-reminders';
import type { Reminder, Priority, ReminderStatus } from '@lifeos/shared';

interface ReminderDetailPanelProps {
  reminder: Reminder | null;
  onClose: () => void;
}

const statusLabels: Record<string, { text: string; color: string }> = {
  pending: { text: 'Pending', color: 'text-primary' },
  snoozed: { text: 'Snoozed', color: 'text-warning' },
  done: { text: 'Completed', color: 'text-success' },
  dismissed: { text: 'Dismissed', color: 'text-muted-foreground' },
};

export function ReminderDetailPanel({ reminder, onClose }: ReminderDetailPanelProps) {
  const updateReminder = useUpdateReminder();
  const deleteReminder = useDeleteReminder();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('medium');
  const [editCategory, setEditCategory] = useState('');
  const [editStatus, setEditStatus] = useState<ReminderStatus>('pending');

  useEffect(() => {
    if (reminder) {
      setEditTitle(reminder.title);
      setEditDescription(reminder.description ?? '');
      setEditDueDate(reminder.dueDate.slice(0, 16));
      setEditPriority(reminder.priority);
      setEditCategory(reminder.category);
      setEditStatus(reminder.status);
      setIsEditing(false);
    }
  }, [reminder]);

  if (!reminder) return null;

  const statusInfo = statusLabels[reminder.status] ?? statusLabels.pending;

  const handleDelete = () => {
    deleteReminder.mutate(reminder.id);
    onClose();
  };

  const handleSave = () => {
    if (!editTitle.trim()) return;
    updateReminder.mutate(
      {
        id: reminder.id,
        title: editTitle.trim(),
        description: editDescription || null,
        dueDate: new Date(editDueDate).toISOString(),
        priority: editPriority,
        category: editCategory,
        status: editStatus,
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
            <span className={cn('text-xs font-medium', statusInfo.color)}>{statusInfo.text}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                title="Edit reminder"
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
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Title</label>
                  <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Description</label>
                  <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} className={inputClass + ' resize-none'} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Due Date</label>
                  <input type="datetime-local" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Priority</label>
                    <select value={editPriority} onChange={(e) => setEditPriority(e.target.value as Priority)} className={inputClass}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Status</label>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as ReminderStatus)} className={inputClass}>
                      <option value="pending">Pending</option>
                      <option value="snoozed">Snoozed</option>
                      <option value="done">Completed</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Category</label>
                  <input type="text" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className={inputClass} />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={!editTitle.trim()}
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
                <h2 className="text-lg font-semibold text-foreground">{reminder.title}</h2>

                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="text-sm text-foreground">
                    <div>{format(new Date(reminder.dueDate), 'EEEE, MMMM d, yyyy')}</div>
                    <div className="text-muted-foreground">{format(new Date(reminder.dueDate), 'h:mm a')}</div>
                  </div>
                </div>

                {reminder.snoozedUntil && reminder.status === 'snoozed' && (
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                    <span className="text-sm text-warning">
                      Snoozed until {format(new Date(reminder.snoozedUntil), 'MMM d, h:mm a')}
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Tag className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-foreground">{reminder.category}</span>
                    <span className={cn(
                      'rounded px-1.5 py-0.5 text-xs',
                      reminder.priority === 'urgent' && 'bg-danger/15 text-danger',
                      reminder.priority === 'high' && 'bg-warning/15 text-warning',
                      reminder.priority === 'medium' && 'bg-primary/15 text-primary',
                      reminder.priority === 'low' && 'bg-card-hover text-muted-foreground',
                    )}>
                      {reminder.priority}
                    </span>
                  </div>
                </div>

                {reminder.isRecurring && reminder.recurrencePattern && (
                  <div className="flex items-start gap-3">
                    <Repeat className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="text-sm text-foreground">
                      Repeats {reminder.recurrencePattern}
                      {reminder.recurrenceEndDate && (
                        <span className="text-muted-foreground"> until {format(new Date(reminder.recurrenceEndDate), 'MMM d, yyyy')}</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Bell className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex items-center gap-3 text-sm text-foreground">
                    {reminder.notifyBrowser && <span>In-app</span>}
                    {reminder.notifyEmail && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> Email
                      </span>
                    )}
                  </div>
                </div>

                {reminder.description && (
                  <div className="rounded-md border border-border bg-background p-3">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{reminder.description}</p>
                  </div>
                )}

                {reminder.completedAt && (
                  <div className="text-xs text-muted-foreground">
                    Completed: {format(new Date(reminder.completedAt), 'MMM d, yyyy h:mm a')}
                  </div>
                )}
              </>
            )}

            {/* Delete */}
            <div className="pt-4 border-t border-border">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete Reminder
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
