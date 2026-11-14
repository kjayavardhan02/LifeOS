const LEGEND_ITEMS = [
  { label: 'Event', color: '#5B9BF0' },
  { label: 'Task', color: '#F4B942' },
  { label: 'Reminder', color: '#DE8863' },
  { label: 'Renewal', color: '#C04741' },
];

export function CalendarLegend() {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-4">
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
