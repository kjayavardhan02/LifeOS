import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { X, MapPin, Clock, Repeat, Tag, Edit2, Trash2 } from 'lucide-react';
import type { CalendarEvent } from '@lifeos/shared';
import { REMINDER_OPTIONS } from '@lifeos/shared';
import { useUpdateEvent, useDeleteEvent } from '../hooks/use-events';

interface EventDetailPanelProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

export function EventDetailPanel({ event, onClose }: EventDetailPanelProps) {
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editColor, setEditColor] = useState('#4E85DE');
  const [editIsAllDay, setEditIsAllDay] = useState(false);
  const [editReminderMinutes, setEditReminderMinutes] = useState('');

  useEffect(() => {
    if (event) {
      setEditTitle(event.title);
      setEditDescription(event.description ?? '');
      setEditStartDate(event.startDate.slice(0, 16));
      setEditEndDate(event.endDate.slice(0, 16));
      setEditLocation(event.location ?? '');
      setEditCategory(event.category);
      setEditColor(event.color);
      setEditIsAllDay(event.isAllDay);
      setEditReminderMinutes(event.reminderMinutes?.toString() ?? '');
      setIsEditing(false);
    }
  }, [event]);

  if (!event) return null;

  const reminderLabel = REMINDER_OPTIONS.find((r) => r.value === event.reminderMinutes)?.label;

  const handleDelete = () => {
    deleteEvent.mutate(event.id);
    onClose();
  };

  const handleSave = () => {
    if (!editTitle.trim()) return;
    updateEvent.mutate(
      {
        id: event.id,
        title: editTitle.trim(),
        description: editDescription || null,
        startDate: new Date(editStartDate).toISOString(),
        endDate: new Date(editEndDate).toISOString(),
        location: editLocation || null,
        category: editCategory,
        color: editColor,
        isAllDay: editIsAllDay,
        reminderMinutes: editReminderMinutes ? parseInt(editReminderMinutes, 10) : null,
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
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: event.color }} />
              <span className="text-xs font-medium text-muted-foreground">{event.category}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                title="Edit event"
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Start Date</label>
                    <input type="datetime-local" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">End Date</label>
                    <input type="datetime-local" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Location</label>
                  <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className={inputClass} placeholder="Location" />
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
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editIsAllDay}
                      onChange={(e) => setEditIsAllDay(e.target.checked)}
                      className="rounded border-border"
                    />
                    All Day
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Reminder</label>
                  <select value={editReminderMinutes} onChange={(e) => setEditReminderMinutes(e.target.value)} className={inputClass}>
                    <option value="">No reminder</option>
                    {REMINDER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
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
                <h2 className="text-lg font-semibold text-foreground">{event.title}</h2>

                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="text-sm">
                    {event.isAllDay ? (
                      <div className="text-foreground">
                        {format(new Date(event.startDate), 'EEEE, MMMM d, yyyy')}
                        {format(new Date(event.startDate), 'yyyy-MM-dd') !== format(new Date(event.endDate), 'yyyy-MM-dd') && (
                          <> &ndash; {format(new Date(event.endDate), 'EEEE, MMMM d, yyyy')}</>
                        )}
                        <div className="text-xs text-muted-foreground">All day</div>
                      </div>
                    ) : (
                      <div className="text-foreground">
                        <div>{format(new Date(event.startDate), 'EEEE, MMMM d, yyyy')}</div>
                        <div className="text-muted-foreground">
                          {format(new Date(event.startDate), 'h:mm a')} &ndash; {format(new Date(event.endDate), 'h:mm a')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm text-foreground">{event.location}</span>
                  </div>
                )}

                {event.isRecurring && event.recurrencePattern && (
                  <div className="flex items-start gap-3">
                    <Repeat className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="text-sm text-foreground">
                      Repeats {event.recurrencePattern}
                      {event.recurrenceEndDate && (
                        <span className="text-muted-foreground"> until {format(new Date(event.recurrenceEndDate), 'MMM d, yyyy')}</span>
                      )}
                    </div>
                  </div>
                )}

                {reminderLabel && (
                  <div className="flex items-start gap-3">
                    <Tag className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm text-foreground">Reminder: {reminderLabel}</span>
                  </div>
                )}

                {event.description && (
                  <div className="rounded-md border border-border bg-background p-3">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{event.description}</p>
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
                Delete Event
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
