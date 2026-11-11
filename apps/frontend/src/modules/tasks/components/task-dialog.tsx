import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Repeat } from 'lucide-react';
import { PRIORITIES, TASK_STATUSES } from '@lifeos/shared';
import type { Task, CreateTaskInput, UpdateTaskInput, RecurrencePattern } from '@lifeos/shared';
import { useCategoryNames } from '@/hooks/use-categories';

const RECURRENCE_OPTIONS: { value: RecurrencePattern; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const WEEKDAYS: { value: string; label: string }[] = [
  { value: 'mon', label: 'M' },
  { value: 'tue', label: 'T' },
  { value: 'wed', label: 'W' },
  { value: 'thu', label: 'T' },
  { value: 'fri', label: 'F' },
  { value: 'sat', label: 'S' },
  { value: 'sun', label: 'S' },
];

interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskInput | (UpdateTaskInput & { id: string })) => void;
  task?: Task | null;
}

export function TaskDialog({ open, onClose, onSubmit, task }: TaskDialogProps) {
  const isEdit = !!task;
  const taskCategories = useCategoryNames('task');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string>('todo');
  const [priority, setPriority] = useState<string>('medium');
  const [category, setCategory] = useState('Personal');
  const [dueDate, setDueDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('daily');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceDays, setRecurrenceDays] = useState<string[]>([]);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [subtasks, setSubtasks] = useState<{ title: string }[]>([]);
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setStatus(task.status);
      setPriority(task.priority);
      setCategory(task.category);
      setDueDate(task.dueDate ? task.dueDate.slice(0, 16) : '');
      setEstimatedMinutes(task.estimatedMinutes?.toString() ?? '');
      setTags(task.tags.join(', '));
      setNotes(task.notes ?? '');
      setIsRecurring(task.isRecurring);
      setRecurrencePattern(task.recurrencePattern ?? 'daily');
      setRecurrenceInterval(task.recurrenceInterval ?? 1);
      setRecurrenceDays(task.recurrenceDays ?? []);
      setRecurrenceEndDate(task.recurrenceEndDate ? task.recurrenceEndDate.slice(0, 16) : '');
      setSubtasks([]);
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setCategory('Personal');
      setDueDate('');
      setEstimatedMinutes('');
      setTags('');
      setNotes('');
      setIsRecurring(false);
      setRecurrencePattern('daily');
      setRecurrenceInterval(1);
      setRecurrenceDays([]);
      setRecurrenceEndDate('');
      setSubtasks([]);
    }
  }, [task, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (isEdit) {
      onSubmit({
        id: task.id,
        title: title.trim(),
        description: description || null,
        status: status as UpdateTaskInput['status'],
        priority: priority as UpdateTaskInput['priority'],
        category,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
        tags: tagList,
        notes: notes || null,
        isRecurring,
        recurrencePattern: isRecurring ? recurrencePattern : null,
        recurrenceInterval: isRecurring ? recurrenceInterval : null,
        recurrenceDays: isRecurring && recurrencePattern === 'weekly' ? recurrenceDays : [],
        recurrenceEndDate: isRecurring && recurrenceEndDate ? new Date(recurrenceEndDate).toISOString() : null,
      });
    } else {
      onSubmit({
        title: title.trim(),
        description: description || undefined,
        status: status as CreateTaskInput['status'],
        priority: priority as CreateTaskInput['priority'],
        category,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
        tags: tagList.length ? tagList : undefined,
        notes: notes || undefined,
        isRecurring: isRecurring || undefined,
        recurrencePattern: isRecurring ? recurrencePattern : undefined,
        recurrenceInterval: isRecurring ? recurrenceInterval : undefined,
        recurrenceDays: isRecurring && recurrencePattern === 'weekly' ? recurrenceDays : undefined,
        recurrenceEndDate: isRecurring && recurrenceEndDate ? new Date(recurrenceEndDate).toISOString() : undefined,
        subtasks: subtasks.length ? subtasks : undefined,
      });
    }
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, { title: newSubtask.trim() }]);
    setNewSubtask('');
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
              {isEdit ? 'Edit Task' : 'New Task'}
            </h2>
            <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="px-4 py-3 space-y-2.5 overflow-y-auto flex-1 min-h-0 overscroll-contain">
              <div>
                <label className={labelClass}>Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className={inputClass}
                  autoFocus
                />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details..."
                  rows={1}
                  className={inputClass + ' resize-none'}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={labelClass}>Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
                    {TASK_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputClass}>
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                    {taskCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={labelClass}>Due Date</label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Est. (min)</label>
                  <input
                    type="number"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(e.target.value)}
                    placeholder="30"
                    min={1}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Tags</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="tag1, tag2"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                  rows={1}
                  className={inputClass + ' resize-none'}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
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
                  <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Recurring</span>
                </label>
                {isRecurring && (
                  <div className="mt-1.5 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className={labelClass}>Every</label>
                        <input
                          type="number"
                          value={recurrenceInterval}
                          onChange={(e) => setRecurrenceInterval(Math.max(1, parseInt(e.target.value) || 1))}
                          min={1}
                          max={365}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Pattern</label>
                        <select value={recurrencePattern} onChange={(e) => setRecurrencePattern(e.target.value as RecurrencePattern)} className={inputClass}>
                          {RECURRENCE_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>End Date</label>
                        <input
                          type="datetime-local"
                          value={recurrenceEndDate}
                          onChange={(e) => setRecurrenceEndDate(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    {recurrencePattern === 'weekly' && (
                      <div>
                        <label className={labelClass}>On days</label>
                        <div className="flex gap-1">
                          {WEEKDAYS.map((day) => (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() =>
                                setRecurrenceDays((prev) =>
                                  prev.includes(day.value)
                                    ? prev.filter((d) => d !== day.value)
                                    : [...prev, day.value],
                                )
                              }
                              className={`flex-1 rounded-md py-1 text-xs font-medium transition-colors ${
                                recurrenceDays.includes(day.value)
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-card-hover text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {day.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!isEdit && (
                <div>
                  <label className={labelClass}>Subtasks</label>
                  <div className="space-y-1.5">
                    {subtasks.map((st, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="flex-1 text-sm text-foreground">{st.title}</span>
                        <button
                          type="button"
                          onClick={() => setSubtasks(subtasks.filter((_, j) => j !== i))}
                          className="text-muted hover:text-danger transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
                        placeholder="Add a subtask..."
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={addSubtask}
                        className="shrink-0 rounded-md bg-card-hover px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="shrink-0 flex justify-end gap-3 px-4 py-2.5 border-t border-border rounded-b-lg">
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
                className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition-colors"
              >
                {isEdit ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
