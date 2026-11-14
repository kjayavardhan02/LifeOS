import { startOfWeek, addDays, format, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import type { CalendarEvent, CalendarFeedItem } from '@lifeos/shared';
import { FEED_SOURCE_ICON } from './feed-item-badge';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  feedItems?: CalendarFeedItem[];
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick: (date: Date) => void;
  onFeedItemClick?: (item: CalendarFeedItem) => void;
}

interface LayoutColumn {
  event: CalendarEvent;
  col: number;
  totalCols: number;
  top: number;
  height: number;
}

function getEventTimes(event: CalendarEvent) {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  const startMin = start.getHours() * 60 + start.getMinutes();
  const endMin = end.getHours() * 60 + end.getMinutes();
  return { startMin, endMin: Math.max(endMin, startMin + 30) };
}

function layoutEvents(events: CalendarEvent[]): LayoutColumn[] {
  if (events.length === 0) return [];

  const items = events.map((event) => {
    const { startMin, endMin } = getEventTimes(event);
    return { event, startMin, endMin };
  }).sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);

  const columns: { endMin: number }[][] = [];
  const result: LayoutColumn[] = [];

  for (const item of items) {
    let placed = false;
    for (let c = 0; c < columns.length; c++) {
      const col = columns[c];
      if (col[col.length - 1].endMin <= item.startMin) {
        col.push({ endMin: item.endMin });
        result.push({
          event: item.event,
          col: c,
          totalCols: 0,
          top: (item.startMin / 60) * 48,
          height: Math.max(((item.endMin - item.startMin) / 60) * 48, 20),
        });
        placed = true;
        break;
      }
    }
    if (!placed) {
      columns.push([{ endMin: item.endMin }]);
      result.push({
        event: item.event,
        col: columns.length - 1,
        totalCols: 0,
        top: (item.startMin / 60) * 48,
        height: Math.max(((item.endMin - item.startMin) / 60) * 48, 20),
      });
    }
  }

  // Find groups of overlapping events and set totalCols
  const sorted = items.map((item, i) => ({ ...item, idx: i }));
  const groups: number[][] = [];
  let currentGroup: number[] = [];
  let groupEnd = 0;

  for (const item of sorted) {
    if (currentGroup.length === 0 || item.startMin < groupEnd) {
      currentGroup.push(item.idx);
      groupEnd = Math.max(groupEnd, item.endMin);
    } else {
      groups.push(currentGroup);
      currentGroup = [item.idx];
      groupEnd = item.endMin;
    }
  }
  if (currentGroup.length > 0) groups.push(currentGroup);

  for (const group of groups) {
    const maxCol = Math.max(...group.map((i) => result[i].col)) + 1;
    for (const i of group) {
      result[i].totalCols = maxCol;
    }
  }

  return result;
}

export function WeekView({ currentDate, events, feedItems = [], onEventClick, onSlotClick, onFeedItemClick }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const allDayEvents = events.filter((e) => e.isAllDay);
  const timedEvents = events.filter((e) => !e.isAllDay);
  const allDayFeedItems = feedItems.filter((i) => i.isAllDay);
  const timedFeedItems = feedItems.filter((i) => !i.isAllDay);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border">
        <div className="border-r border-border" />
        {days.map((day) => (
          <div key={day.toISOString()} className={cn('px-2 py-2 text-center border-r border-border last:border-r-0', isToday(day) && 'bg-primary/5')}>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted">
              {format(day, 'EEE')}
            </div>
            <div className={cn(
              'mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium',
              isToday(day) ? 'bg-primary text-white' : 'text-foreground',
            )}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* All-day events row */}
      {(allDayEvents.length > 0 || allDayFeedItems.length > 0) && (
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border">
          <div className="border-r border-border px-1 py-1 text-xs text-muted flex items-center justify-center">
            All day
          </div>
          {days.map((day) => {
            const dayAllDay = allDayEvents.filter((e) => isSameDay(new Date(e.startDate), day));
            const dayAllDayFeed = allDayFeedItems.filter((i) => isSameDay(new Date(i.startDate), day));
            return (
              <div key={day.toISOString()} className="border-r border-border last:border-r-0 p-1 min-h-[32px] space-y-0.5">
                {dayAllDay.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="w-full truncate rounded px-1.5 py-0.5 text-xs hover:opacity-80"
                    style={{ backgroundColor: event.color + '25', color: event.color }}
                  >
                    {event.title}
                  </button>
                ))}
                {dayAllDayFeed.map((item) => {
                  const Icon = FEED_SOURCE_ICON[item.source];
                  return (
                    <button
                      key={item.id}
                      onClick={() => onFeedItemClick?.(item)}
                      className="flex w-full items-center gap-1 truncate rounded border border-dashed px-1.5 py-0.5 text-xs hover:opacity-80"
                      style={{ backgroundColor: item.color + '15', color: item.color, borderColor: item.color + '50' }}
                    >
                      <Icon className="h-3 w-3 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Time grid */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] max-h-[600px] overflow-y-auto">
        <div className="border-r border-border">
          {HOURS.map((hour) => (
            <div key={hour} className="h-12 border-b border-border px-1 text-right">
              <span className="relative -top-2 text-xs text-muted">
                {hour === 0 ? '' : format(new Date().setHours(hour, 0), 'h a')}
              </span>
            </div>
          ))}
        </div>
        {days.map((day) => {
          const dayTimedEvents = timedEvents.filter((e) => isSameDay(new Date(e.startDate), day));
          const laid = layoutEvents(dayTimedEvents);
          const dayTimedFeedItems = timedFeedItems.filter((i) => isSameDay(new Date(i.startDate), day));
          return (
            <div key={day.toISOString()} className={cn('relative border-r border-border last:border-r-0', isToday(day) && 'bg-primary/3')}>
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="h-12 border-b border-border hover:bg-card-hover/30 cursor-pointer"
                  onClick={() => {
                    const d = new Date(day);
                    d.setHours(hour, 0, 0, 0);
                    onSlotClick(d);
                  }}
                />
              ))}
              {laid.map((item) => {
                const widthPct = 100 / item.totalCols;
                const leftPct = item.col * widthPct;
                return (
                  <button
                    key={item.event.id}
                    onClick={() => onEventClick(item.event)}
                    className="absolute overflow-hidden rounded px-1 py-0.5 text-xs hover:opacity-80"
                    style={{
                      top: item.top,
                      height: Math.max(item.height, 20),
                      left: `calc(${leftPct}% + 2px)`,
                      width: `calc(${widthPct}% - 4px)`,
                      backgroundColor: item.event.color + '30',
                      color: item.event.color,
                      borderLeft: `3px solid ${item.event.color}`,
                    }}
                  >
                    <div className="font-medium truncate">{item.event.title}</div>
                    <div className="text-[10px] opacity-80">
                      {format(new Date(item.event.startDate), 'h:mm a')}
                    </div>
                  </button>
                );
              })}
              {dayTimedFeedItems.map((feedItem) => {
                const start = new Date(feedItem.startDate);
                const startMin = start.getHours() * 60 + start.getMinutes();
                const Icon = FEED_SOURCE_ICON[feedItem.source];
                return (
                  <button
                    key={feedItem.id}
                    onClick={() => onFeedItemClick?.(feedItem)}
                    title={feedItem.title}
                    className="absolute right-0.5 z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-dashed shadow-sm hover:scale-110 transition-transform"
                    style={{
                      top: (startMin / 60) * 48 - 2,
                      backgroundColor: feedItem.color + '30',
                      color: feedItem.color,
                      borderColor: feedItem.color,
                    }}
                  >
                    <Icon className="h-2.5 w-2.5" />
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
