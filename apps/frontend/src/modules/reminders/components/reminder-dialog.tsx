import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Repeat } from 'lucide-react';
import { PRIORITIES } from '@lifeos/shared';
import type { Reminder, CreateReminderInput, UpdateReminderInput, Priority, RecurrencePattern } from '@lifeos/shared';
import { useCategoryNames } from '@/hooks/use-categories';

const RECURRENCE_OPTIONS: { value: RecurrencePattern; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

interface ReminderDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateReminderInput | (UpdateReminderInput & { id: string })) => void;
  reminder?: Reminder | null;
}

function toLocalDatetime(dateStr: string): string {
  const d = new Date(dateStr);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function getDefaultDue(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export function ReminderDialog({ open, onClose, onSubmit, reminder }: ReminderDialogProps) {
  const reminderCategories = useCategoryNames('reminder');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('Custom');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('weekly');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [notifyBrowser, setNotifyBrowser] = useState(true);

  useEffect(() => {
    if (reminder) {
      setTitle(reminder.title);
      setDescription(reminder.description ?? '');
      setDueDate(toLocalDatetime(reminder.dueDate));
      setPriority(reminder.priority);
      setCategory(reminder.category);
      setIsRecurring(reminder.isRecurring);
      setRecurrencePattern(reminder.recurrencePattern ?? 'weekly');
      setRecurrenceEndDate(reminder.recurrenceEndDate ? toLocalDatetime(reminder.recurrenceEndDate) : '');
      setNotifyEmail(reminder.notifyEmail);
      setNotifyBrowser(reminder.notifyBrowser);
    } else {
      setTitle('');
      setDescription('');
      setDueDate(getDefaultDue());
      setPriority('medium');
      setCategory('Custom');
      setIsRecurring(false);
      setRecurrencePattern('weekly');
      setRecurrenceEndDate('');
      setNotifyEmail(false);
      setNotifyBrowser(true);
    }
  }, [reminder, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    const base = {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: new Date(dueDate).toISOString(),
      priority,
      category,
      isRecurring,
      recurrencePattern: isRecurring ? recurrencePattern : undefined,
      recurrenceEndDate: isRecurring && recurrenceEndDate ? new Date(recurrenceEndDate).toISOString() : undefined,
      notifyEmail,
      notifyBrowser,
    };

    if (reminder) {
      onSubmit({ ...base, id: reminder.id });
    } else {
      onSubmit(base);
    }
  };

  const inputClass = 'w-full rounded-md border border-border bg-input px-3 py-1.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary';
  const labelClass = 'block text-xs font-medium text-muted-foreground mb-1';

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 animate-overlay-in" onClick={onClose} />
      <div className="absolute inset-0 overflow-hidden flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full max-w-lg rounded-lg border border-border bg-card shadow-2xl flex flex-col overflow-hidden animate-dialog-in pointer-events-auto" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
          <div className="shrink-0 flex items-center justify-between border-b border-border bg-card px-4 py-2.5 rounded-t-lg">
            <h2 className="text-base font-semibold text-foreground">
              {reminder ? 'Edit Reminder' : 'New Reminder'}
            </h2>
            <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="px-4 py-3 space-y-2.5 overflow-y-auto flex-1 min-h-0 overscroll-contain">
              <div>
                <label className={labelClass}>Title *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Reminder title" className={inputClass} autoFocus required />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add details..." rows={1} className={inputClass + ' resize-none'} />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={labelClass}>Due Date *</label>
                  <input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={inputClass}>
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                    {reminderCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-muted-foreground">Notify:</span>
                <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                  <input type="checkbox" checked={notifyBrowser} onChange={(e) => setNotifyBrowser(e.target.checked)} className="rounded border-border" />
                  In-app
                </label>
                <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                  <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} className="rounded border-border" />
                  Email
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Recurring</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRecurring(!isRecurring)}
                    className={`relative inline-flex h-4 w-8 shrink-0 items-center rounded-full transition-colors ${
                      isRecurring ? 'bg-primary' : 'bg-border'
                    }`}
                  >
                    <span
                      className="inline-block h-3 w-3 rounded-full bg-white shadow transition-transform"
                      style={{ transform: isRecurring ? 'translateX(17px)' : 'translateX(2px)' }}
                    />
                  </button>
                </div>
                {isRecurring && (
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelClass}>Pattern</label>
                      <select value={recurrencePattern} onChange={(e) => setRecurrencePattern(e.target.value as RecurrencePattern)} className={inputClass}>
                        {RECURRENCE_OPTIONS.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>End date</label>
                      <input
                        type="date"
                        value={recurrenceEndDate ? recurrenceEndDate.slice(0, 10) : ''}
                        onChange={(e) => setRecurrenceEndDate(e.target.value ? e.target.value + 'T23:59' : '')}
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 flex justify-end gap-3 px-4 py-2.5 border-t border-border rounded-b-lg">
              <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
              <button type="submit" className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors">
                {reminder ? 'Save Changes' : 'Create Reminder'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
