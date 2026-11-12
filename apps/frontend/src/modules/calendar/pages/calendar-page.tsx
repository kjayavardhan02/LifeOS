import { useState } from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Columns3,
  Square,
  List,
} from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { useEvents, useCreateEvent, useUpdateEvent } from '../hooks/use-events';
import { MonthView } from '../components/month-view';
import { WeekView } from '../components/week-view';
import { DayView } from '../components/day-view';
import { AgendaView } from '../components/agenda-view';
import { EventDialog } from '../components/event-dialog';
import { EventDetailPanel } from '../components/event-detail-panel';
import type { CalendarEvent, CreateEventInput, UpdateEventInput } from '@lifeos/shared';

type ViewMode = 'month' | 'week' | 'day' | 'agenda';

const viewOptions: { mode: ViewMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { mode: 'month', label: 'Month', icon: LayoutGrid },
  { mode: 'week', label: 'Week', icon: Columns3 },
  { mode: 'day', label: 'Day', icon: Square },
  { mode: 'agenda', label: 'Agenda', icon: List },
];

function getDateRange(view: ViewMode, date: Date) {
  switch (view) {
    case 'month': {
      const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
      return { startFrom: start.toISOString(), startTo: end.toISOString() };
    }
    case 'week': {
      const start = startOfWeek(date, { weekStartsOn: 1 });
      const end = endOfWeek(date, { weekStartsOn: 1 });
      return { startFrom: start.toISOString(), startTo: end.toISOString() };
    }
    case 'day': {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      return { startFrom: start.toISOString(), startTo: end.toISOString() };
    }
    case 'agenda': {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = addDays(start, 30);
      return { startFrom: start.toISOString(), startTo: end.toISOString() };
    }
  }
}

export function CalendarPage() {
  const [view, setView] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [defaultDate, setDefaultDate] = useState<Date | undefined>(undefined);

  const dateRange = getDateRange(view, currentDate);
  const { data, isLoading } = useEvents({ ...dateRange, limit: 100 });
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();


  const events = data?.data ?? [];

  const navigatePrev = () => {
    switch (view) {
      case 'month': setCurrentDate(subMonths(currentDate, 1)); break;
      case 'week': setCurrentDate(subWeeks(currentDate, 1)); break;
      case 'day': setCurrentDate(subDays(currentDate, 1)); break;
      case 'agenda': setCurrentDate(subDays(currentDate, 30)); break;
    }
  };

  const navigateNext = () => {
    switch (view) {
      case 'month': setCurrentDate(addMonths(currentDate, 1)); break;
      case 'week': setCurrentDate(addWeeks(currentDate, 1)); break;
      case 'day': setCurrentDate(addDays(currentDate, 1)); break;
      case 'agenda': setCurrentDate(addDays(currentDate, 30)); break;
    }
  };

  const getTitle = () => {
    switch (view) {
      case 'month': return format(currentDate, 'MMMM yyyy');
      case 'week': {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
      }
      case 'day': return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'agenda': return `${format(currentDate, 'MMM d')} – ${format(addDays(currentDate, 30), 'MMM d, yyyy')}`;
    }
  };

  const handleSubmit = (input: CreateEventInput | (UpdateEventInput & { id: string })) => {
    if ('id' in input) {
      updateEvent.mutate(input, { onSuccess: () => { setDialogOpen(false); setEditingEvent(null); } });
    } else {
      createEvent.mutate(input, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleDayClick = (date: Date) => {
    setDefaultDate(date);
    setEditingEvent(null);
    setDialogOpen(true);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Calendar & Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">{data?.meta?.total ?? 0} events</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-md border border-border">
            {viewOptions.map(({ mode, label, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => setView(mode)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors first:rounded-l-md last:rounded-r-md',
                  view === mode
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => { setEditingEvent(null); setDefaultDate(undefined); setDialogOpen(true); }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B9BF0] to-[#3D6FBF] px-5 py-2 text-sm font-medium text-white shadow-[0_2px_12px_rgba(91,155,240,0.3)] hover:shadow-[0_4px_20px_rgba(91,155,240,0.4)] transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Event
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{getTitle()}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={navigatePrev}
            className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="rounded-md border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Today
          </button>
          <button
            onClick={navigateNext}
            className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : view === 'month' ? (
        <MonthView
          currentDate={currentDate}
          events={events}
          onEventClick={handleEventClick}
          onDayClick={handleDayClick}
        />
      ) : view === 'week' ? (
        <WeekView
          currentDate={currentDate}
          events={events}
          onEventClick={handleEventClick}
          onSlotClick={handleDayClick}
        />
      ) : view === 'day' ? (
        <DayView
          currentDate={currentDate}
          events={events}
          onEventClick={handleEventClick}
          onSlotClick={handleDayClick}
        />
      ) : (
        <AgendaView
          currentDate={currentDate}
          events={events}
          onEventClick={handleEventClick}
        />
      )}

      <EventDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingEvent(null); }}
        onSubmit={handleSubmit}
        event={editingEvent}
        defaultDate={defaultDate}
      />

      <EventDetailPanel
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
