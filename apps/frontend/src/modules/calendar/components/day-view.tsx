import { format, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import type { CalendarEvent, CalendarFeedItem } from '@lifeos/shared';
import { FEED_SOURCE_ICON } from './feed-item-badge';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const SLOT_HEIGHT = 60;

interface DayViewProps {
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
          top: (item.startMin / 60) * SLOT_HEIGHT,
          height: Math.max(((item.endMin - item.startMin) / 60) * SLOT_HEIGHT, 24),
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
        top: (item.startMin / 60) * SLOT_HEIGHT,
        height: Math.max(((item.endMin - item.startMin) / 60) * SLOT_HEIGHT, 24),
      });
    }
  }

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

export function DayView({ currentDate, events, feedItems = [], onEventClick, onSlotClick, onFeedItemClick }: DayViewProps) {
  const dayEvents = events.filter((e) => isSameDay(new Date(e.startDate), currentDate));
  const allDayEvents = dayEvents.filter((e) => e.isAllDay);
  const timedEvents = dayEvents.filter((e) => !e.isAllDay);
  const today = isToday(currentDate);
  const laid = layoutEvents(timedEvents);

  const dayFeedItems = feedItems.filter((i) => isSameDay(new Date(i.startDate), currentDate));
  const allDayFeedItems = dayFeedItems.filter((i) => i.isAllDay);
  const timedFeedItems = dayFeedItems.filter((i) => !i.isAllDay);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className={cn('border-b border-border px-4 py-3', today && 'bg-primary/5')}>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted">
          {format(currentDate, 'EEEE')}
        </div>
        <div className={cn(
          'mt-1 text-2xl font-bold',
          today ? 'text-primary' : 'text-foreground',
        )}>
          {format(currentDate, 'MMMM d, yyyy')}
        </div>
      </div>

      {(allDayEvents.length > 0 || allDayFeedItems.length > 0) && (
        <div className="border-b border-border p-2 space-y-1">
          <span className="text-xs text-muted font-medium">All day</span>
          {allDayEvents.map((event) => (
            <button
              key={event.id}
              onClick={() => onEventClick(event)}
              className="w-full truncate rounded px-2 py-1 text-left text-sm hover:opacity-80"
              style={{ backgroundColor: event.color + '25', color: event.color }}
            >
              {event.title}
            </button>
          ))}
          {allDayFeedItems.map((item) => {
            const Icon = FEED_SOURCE_ICON[item.source];
            return (
              <button
                key={item.id}
                onClick={() => onFeedItemClick?.(item)}
                className="flex w-full items-center gap-1.5 truncate rounded border border-dashed px-2 py-1 text-left text-sm hover:opacity-80"
                style={{ backgroundColor: item.color + '15', color: item.color, borderColor: item.color + '50' }}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{item.title}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex max-h-[600px] overflow-y-auto">
        {/* Time gutter */}
        <div className="w-16 shrink-0 border-r border-border">
          {HOURS.map((hour) => (
            <div key={hour} style={{ height: SLOT_HEIGHT }} className="border-b border-border px-2 text-right">
              <span className="relative -top-2 text-xs text-muted">
                {hour === 0 ? '' : format(new Date().setHours(hour, 0), 'h a')}
              </span>
            </div>
          ))}
        </div>

        {/* Event area */}
        <div className="flex-1 relative">
          {HOURS.map((hour) => (
            <div
              key={hour}
              style={{ height: SLOT_HEIGHT }}
              className="border-b border-border hover:bg-card-hover/30 cursor-pointer"
              onClick={() => {
                const d = new Date(currentDate);
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
                className="absolute overflow-hidden rounded px-3 py-1 text-left hover:opacity-80"
                style={{
                  top: item.top,
                  height: Math.max(item.height, 24),
                  left: `calc(${leftPct}% + 2px)`,
                  width: `calc(${widthPct}% - 4px)`,
                  backgroundColor: item.event.color + '30',
                  color: item.event.color,
                  borderLeft: `4px solid ${item.event.color}`,
                }}
              >
                <div className="text-sm font-medium truncate">{item.event.title}</div>
                <div className="text-xs opacity-80">
                  {format(new Date(item.event.startDate), 'h:mm a')} – {format(new Date(item.event.endDate), 'h:mm a')}
                </div>
                {item.event.location && (
                  <div className="text-xs opacity-70 truncate">{item.event.location}</div>
                )}
              </button>
            );
          })}

          {timedFeedItems.map((feedItem) => {
            const start = new Date(feedItem.startDate);
            const startMin = start.getHours() * 60 + start.getMinutes();
            const Icon = FEED_SOURCE_ICON[feedItem.source];
            return (
              <button
                key={feedItem.id}
                onClick={() => onFeedItemClick?.(feedItem)}
                title={`${feedItem.title} · ${format(start, 'h:mm a')}`}
                className="absolute right-1 z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-dashed shadow-sm hover:scale-110 transition-transform"
                style={{
                  top: (startMin / 60) * SLOT_HEIGHT - 2,
                  backgroundColor: feedItem.color + '30',
                  color: feedItem.color,
                  borderColor: feedItem.color,
                }}
              >
                <Icon className="h-3 w-3" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
