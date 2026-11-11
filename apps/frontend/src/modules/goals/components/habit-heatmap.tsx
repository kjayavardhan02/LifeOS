import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { HabitLog } from '@lifeos/shared';

interface HabitHeatmapProps {
  logs: HabitLog[];
  color?: string;
  weeks?: number;
}

export function HabitHeatmap({ logs, color = '#4E85DE', weeks = 20 }: HabitHeatmapProps) {
  const { grid, months } = useMemo(() => {
    const logMap = new Map<string, number>();
    for (const log of logs) {
      const dateStr = new Date(log.date).toISOString().split('T')[0]!;
      logMap.set(dateStr, (logMap.get(dateStr) ?? 0) + log.value);
    }

    const today = new Date();
    const totalDays = weeks * 7;
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - totalDays + 1);

    const startDay = startDate.getDay();
    const gridData: Array<{ date: string; value: number; dayOfWeek: number }> = [];
    const monthLabels: Array<{ label: string; col: number }> = [];
    let lastMonth = -1;

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0]!;
      const dayOfWeek = d.getDay();

      if (d.getMonth() !== lastMonth) {
        const col = Math.floor((i + startDay) / 7);
        monthLabels.push({
          label: d.toLocaleString('default', { month: 'short' }),
          col,
        });
        lastMonth = d.getMonth();
      }

      gridData.push({
        date: dateStr,
        value: logMap.get(dateStr) ?? 0,
        dayOfWeek,
      });
    }

    return { grid: gridData, months: monthLabels };
  }, [logs, weeks]);

  const maxValue = Math.max(1, ...grid.map((g) => g.value));

  const getOpacity = (value: number): number => {
    if (value === 0) return 0;
    return 0.2 + (value / maxValue) * 0.8;
  };

  const cols = Math.ceil(grid.length / 7);

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-0.5 mb-1 ml-6">
        {months.map((m, i) => (
          <span
            key={i}
            className="text-[10px] text-muted-foreground"
            style={{ marginLeft: `${m.col * 13}px`, position: 'absolute' }}
          >
            {m.label}
          </span>
        ))}
      </div>
      <div className="relative mt-4">
        <div className="flex gap-0.5">
          <div className="flex flex-col gap-0.5 mr-1">
            {['', 'M', '', 'W', '', 'F', ''].map((label, i) => (
              <span key={i} className="flex h-[11px] w-4 items-center text-[9px] text-muted-foreground">
                {label}
              </span>
            ))}
          </div>
          {Array.from({ length: cols }, (_, col) => (
            <div key={col} className="flex flex-col gap-0.5">
              {Array.from({ length: 7 }, (_, row) => {
                const idx = col * 7 + row;
                const cell = grid[idx];
                if (!cell) return <div key={row} className="h-[11px] w-[11px]" />;

                return (
                  <div
                    key={row}
                    className={cn(
                      'h-[11px] w-[11px] rounded-[2px] transition-colors',
                      cell.value === 0 ? 'bg-border' : '',
                    )}
                    style={
                      cell.value > 0
                        ? { backgroundColor: color, opacity: getOpacity(cell.value) }
                        : undefined
                    }
                    title={`${cell.date}: ${cell.value > 0 ? cell.value : 'No entry'}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
