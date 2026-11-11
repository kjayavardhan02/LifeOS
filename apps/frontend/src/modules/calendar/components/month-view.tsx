import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import type { CalendarEvent } from '@lifeos/shared';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDayClick: (date: Date) => void;
}

interface MorePopover {
  day: Date;
  events: CalendarEvent[];
  rect: { top: number; left: number };
}

export function MonthView({ currentDate, events, onEventClick, onDayClick }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const [morePopover, setMorePopover] = useState<MorePopover | null>(null);

  const eventsByDate = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const key = format(new Date(event.startDate), 'yyyy-MM-dd');
    const existing = eventsByDate.get(key) ?? [];
    existing.push(event);
    eventsByDate.set(key, existing);
  }

  const handleShowMore = (e: React.MouseEvent, day: Date, dayEvents: CalendarEvent[]) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMorePopover({
      day,
      events: dayEvents,
      rect: { top: rect.bottom + 4, left: rect.left },
    });
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((day) => (
          <div key={day} className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDate.get(key) ?? [];
          const inMonth = isSameMonth(day, currentDate);
          const today = isToday(day);

          return (
            <div
              key={i}
              className={cn(
                'min-h-[110px] border-b border-r border-border p-1.5 cursor-pointer transition-colors hover:bg-card-hover/50',
                !inMonth && 'bg-background/50',
                today && 'bg-primary/5',
              )}
              onClick={() => onDayClick(day)}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs',
                    today ? 'bg-primary text-white font-bold' : inMonth ? 'text-foreground' : 'text-muted',
                  )}
                >
                  {format(day, 'd')}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-xs text-muted">{dayEvents.length}</span>
                )}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((event) => (
                  <button
                    key={event.id}
                    onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                    className="w-full truncate rounded px-1.5 py-0.5 text-left text-xs transition-colors hover:opacity-80"
                    style={{ backgroundColor: event.color + '25', color: event.color }}
                  >
                    {!event.isAllDay && (
                      <span className="font-medium">{format(new Date(event.startDate), 'HH:mm')} </span>
                    )}
                    {event.title}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <button
                    onClick={(e) => handleShowMore(e, day, dayEvents)}
                    className="w-full rounded px-1.5 py-0.5 text-center text-xs text-primary hover:bg-primary/10 transition-colors font-medium"
                  >
                    +{dayEvents.length - 3} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {morePopover && (
        <MoreEventsPopover
          day={morePopover.day}
          events={morePopover.events}
          anchorRect={morePopover.rect}
          onEventClick={(event) => {
            setMorePopover(null);
            onEventClick(event);
          }}
          onClose={() => setMorePopover(null)}
        />
      )}
    </div>
  );
}

interface MoreEventsPopoverProps {
  day: Date;
  events: CalendarEvent[];
  anchorRect: { top: number; left: number };
  onEventClick: (event: CalendarEvent) => void;
  onClose: () => void;
}

function MoreEventsPopover({ day, events, anchorRect, onEventClick, onClose }: MoreEventsPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(anchorRect);

  useEffect(() => {
    const el = popoverRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let { top, left } = anchorRect;
    if (top + rect.height > window.innerHeight - 8) {
      top = anchorRect.top - rect.height - 32;
    }
    if (left + rect.width > window.innerWidth - 8) {
      left = window.innerWidth - rect.width - 8;
    }
    if (left < 8) left = 8;
    setPosition({ top, left });
  }, [anchorRect]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        ref={popoverRef}
        className="absolute w-64 rounded-lg border border-border bg-card shadow-xl overflow-hidden"
        style={{ top: position.top, left: position.left }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card">
          <span className="text-sm font-semibold text-foreground">
            {format(day, 'EEEE, MMM d')}
          </span>
          <button onClick={onClose} className="rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="max-h-[240px] overflow-y-auto p-2 space-y-1">
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => onEventClick(event)}
              className="w-full truncate rounded px-2 py-1.5 text-left text-xs transition-colors hover:opacity-80"
              style={{ backgroundColor: event.color + '25', color: event.color }}
            >
              {!event.isAllDay && (
                <span className="font-medium">{format(new Date(event.startDate), 'h:mm a')} </span>
              )}
              {event.title}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
