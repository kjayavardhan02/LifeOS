import { format, isSameDay, isToday, isTomorrow, addDays } from 'date-fns';
import { MapPin, Clock, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CalendarEvent, CalendarFeedItem } from '@lifeos/shared';
import { FEED_SOURCE_ICON } from './feed-item-badge';

interface AgendaViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  feedItems?: CalendarFeedItem[];
  onEventClick: (event: CalendarEvent) => void;
  onFeedItemClick?: (item: CalendarFeedItem) => void;
}

export function AgendaView({ currentDate, events, feedItems = [], onEventClick, onFeedItemClick }: AgendaViewProps) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const grouped = new Map<string, CalendarEvent[]>();
  for (const event of sortedEvents) {
    const key = format(new Date(event.startDate), 'yyyy-MM-dd');
    const existing = grouped.get(key) ?? [];
    existing.push(event);
    grouped.set(key, existing);
  }

  const feedGrouped = new Map<string, CalendarFeedItem[]>();
  for (const item of feedItems) {
    const key = format(new Date(item.startDate), 'yyyy-MM-dd');
    const existing = feedGrouped.get(key) ?? [];
    existing.push(item);
    feedGrouped.set(key, existing);
  }

  const allDateKeys = Array.from(new Set([...grouped.keys(), ...feedGrouped.keys()])).sort();

  if (sortedEvents.length === 0 && feedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <Clock className="h-10 w-10 text-muted" />
        <p className="mt-3 text-sm text-muted-foreground">No events in this period</p>
        <p className="mt-1 text-xs text-muted">Create an event to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {allDateKeys.map((dateKey) => {
        const dayEvents = grouped.get(dateKey) ?? [];
        const dayFeedItems = feedGrouped.get(dateKey) ?? [];
        const date = new Date(dateKey + 'T12:00:00');
        const today = isToday(date);
        const tomorrow = isTomorrow(date);

        let dateLabel = format(date, 'EEEE, MMMM d');
        if (today) dateLabel = 'Today — ' + dateLabel;
        else if (tomorrow) dateLabel = 'Tomorrow — ' + dateLabel;

        return (
          <div key={dateKey}>
            <div className={cn(
              'mb-2 px-1 text-sm font-semibold',
              today ? 'text-primary' : 'text-foreground',
            )}>
              {dateLabel}
            </div>
            <div className="space-y-1.5">
              {dayEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="flex w-full items-start gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-card-hover"
                >
                  <div className="mt-0.5 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: event.color }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground truncate">{event.title}</span>
                      {event.isRecurring && <Repeat className="h-3 w-3 shrink-0 text-muted-foreground" />}
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                      {event.isAllDay ? (
                        <span>All day</span>
                      ) : (
                        <span>
                          {format(new Date(event.startDate), 'h:mm a')} – {format(new Date(event.endDate), 'h:mm a')}
                        </span>
                      )}
                      <span className="rounded px-1.5 py-0.5 text-xs" style={{ backgroundColor: event.color + '15', color: event.color }}>
                        {event.category}
                      </span>
                    </div>
                    {event.location && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                    )}
                  </div>
                </button>
              ))}
              {dayFeedItems.map((item) => {
                const Icon = FEED_SOURCE_ICON[item.source];
                return (
                  <button
                    key={item.id}
                    onClick={() => onFeedItemClick?.(item)}
                    className="flex w-full items-start gap-3 rounded-lg border border-dashed bg-card p-3 text-left transition-colors hover:bg-card-hover"
                    style={{ borderColor: item.color + '50' }}
                  >
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: item.color }} />
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-sm text-foreground truncate">{item.title}</span>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                        {item.isAllDay ? (
                          <span>All day</span>
                        ) : (
                          <span>{format(new Date(item.startDate), 'h:mm a')}</span>
                        )}
                        <span className="rounded px-1.5 py-0.5 text-xs" style={{ backgroundColor: item.color + '15', color: item.color }}>
                          Read-only
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
