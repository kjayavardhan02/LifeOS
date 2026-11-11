import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Repeat } from 'lucide-react';
import { EVENT_CATEGORY_COLORS, REMINDER_OPTIONS } from '@lifeos/shared';
import type { CalendarEvent, CreateEventInput, UpdateEventInput, RecurrencePattern } from '@lifeos/shared';
import { useCategoryNames } from '@/hooks/use-categories';

const RECURRENCE_OPTIONS: { value: RecurrencePattern; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateEventInput | (UpdateEventInput & { id: string })) => void;
  event?: CalendarEvent | null;
  defaultDate?: Date;
}

function toLocalDatetime(dateStr: string): string {
  const d = new Date(dateStr);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function getDefaultStart(defaultDate?: Date): string {
  const d = defaultDate ? new Date(defaultDate) : new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function getDefaultEnd(startStr: string): string {
  const d = new Date(startStr);
  d.setHours(d.getHours() + 1);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export function EventDialog({ open, onClose, onSubmit, event, defaultDate }: EventDialogProps) {
  const eventCategories = useCategoryNames('event');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Personal');
  const [color, setColor] = useState(EVENT_CATEGORY_COLORS['Personal']);
  const [isAllDay, setIsAllDay] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('weekly');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description ?? '');
      setStartDate(toLocalDatetime(event.startDate));
      setEndDate(toLocalDatetime(event.endDate));
      setLocation(event.location ?? '');
      setCategory(event.category);
      setColor(event.color);
      setIsAllDay(event.isAllDay);
      setIsRecurring(event.isRecurring);
      setRecurrencePattern(event.recurrencePattern ?? 'weekly');
      setRecurrenceEndDate(event.recurrenceEndDate ? toLocalDatetime(event.recurrenceEndDate) : '');
      setReminderMinutes(event.reminderMinutes ?? undefined);
    } else {
      const start = getDefaultStart(defaultDate);
      setTitle('');
      setDescription('');
      setStartDate(start);
      setEndDate(getDefaultEnd(start));
      setLocation('');
      setCategory('Personal');
      setColor(EVENT_CATEGORY_COLORS['Personal']);
      setIsAllDay(false);
      setIsRecurring(false);
      setRecurrencePattern('weekly');
      setRecurrenceEndDate('');
      setReminderMinutes(undefined);
    }
  }, [event, open, defaultDate]);

  if (!open) return null;

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setColor(EVENT_CATEGORY_COLORS[cat] ?? '#4E85DE');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) return;

    const base = {
      title: title.trim(),
      description: description.trim() || undefined,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      location: location.trim() || undefined,
      category,
      color,
      isAllDay,
      isRecurring,
      recurrencePattern: isRecurring ? recurrencePattern : undefined,
      recurrenceEndDate: isRecurring && recurrenceEndDate ? new Date(recurrenceEndDate).toISOString() : undefined,
      reminderMinutes,
    };

    if (event) {
      onSubmit({ ...base, id: event.id });
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
              {event ? 'Edit Event' : 'New Event'}
            </h2>
            <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="px-4 py-3 space-y-2.5 overflow-y-auto flex-1 min-h-0 overscroll-contain">
              <div>
                <label className={labelClass}>Title *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" className={inputClass} autoFocus required />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add details..." rows={1} className={inputClass + ' resize-none'} />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input type="checkbox" checked={isAllDay} onChange={(e) => setIsAllDay(e.target.checked)} className="rounded border-border" />
                  All day
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>Start *</label>
                  <input
                    type={isAllDay ? 'date' : 'datetime-local'}
                    value={isAllDay ? startDate.slice(0, 10) : startDate}
                    onChange={(e) => {
                      const val = isAllDay ? e.target.value + 'T00:00' : e.target.value;
                      setStartDate(val);
                      if (new Date(val) >= new Date(endDate)) {
                        setEndDate(getDefaultEnd(val));
                      }
                    }}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>End *</label>
                  <input
                    type={isAllDay ? 'date' : 'datetime-local'}
                    value={isAllDay ? endDate.slice(0, 10) : endDate}
                    onChange={(e) => {
                      const val = isAllDay ? e.target.value + 'T23:59' : e.target.value;
                      setEndDate(val);
                    }}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={labelClass}>Location</label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Add location" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Category</label>
                  <select value={category} onChange={(e) => handleCategoryChange(e.target.value)} className={inputClass}>
                    {eventCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Reminder</label>
                  <select
                    value={reminderMinutes ?? ''}
                    onChange={(e) => setReminderMinutes(e.target.value ? Number(e.target.value) : undefined)}
                    className={inputClass}
                  >
                    <option value="">None</option>
                    {REMINDER_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className={labelClass + ' mb-0'}>Color</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-7 w-10 cursor-pointer rounded border border-border bg-input"
                />
                <span className="text-xs text-muted-foreground">{color}</span>
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
                {event ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
