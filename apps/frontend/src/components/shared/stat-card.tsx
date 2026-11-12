import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type AccentColor = 'primary' | 'success' | 'warning' | 'danger' | 'info';

const accentStyles: Record<AccentColor, { border: string; iconBg: string; iconText: string; glow: string }> = {
  primary: {
    border: 'border-[#5B9BF0]/20 hover:border-[#5B9BF0]/40',
    iconBg: 'bg-[#5B9BF0]/10',
    iconText: 'text-[#5B9BF0]',
    glow: 'hover:shadow-[0_0_24px_rgba(91,155,240,0.12)]',
  },
  success: {
    border: 'border-[#2BD47D]/20 hover:border-[#2BD47D]/40',
    iconBg: 'bg-[#2BD47D]/10',
    iconText: 'text-[#2BD47D]',
    glow: 'hover:shadow-[0_0_24px_rgba(43,212,125,0.12)]',
  },
  warning: {
    border: 'border-[#F5C344]/20 hover:border-[#F5C344]/40',
    iconBg: 'bg-[#F5C344]/10',
    iconText: 'text-[#F5C344]',
    glow: 'hover:shadow-[0_0_24px_rgba(245,195,68,0.12)]',
  },
  danger: {
    border: 'border-[#E05A52]/20 hover:border-[#E05A52]/40',
    iconBg: 'bg-[#E05A52]/10',
    iconText: 'text-[#E05A52]',
    glow: 'hover:shadow-[0_0_24px_rgba(224,90,82,0.12)]',
  },
  info: {
    border: 'border-[#E89B6E]/20 hover:border-[#E89B6E]/40',
    iconBg: 'bg-[#E89B6E]/10',
    iconText: 'text-[#E89B6E]',
    glow: 'hover:shadow-[0_0_24px_rgba(232,155,110,0.12)]',
  },
};

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accent?: AccentColor;
  trend?: { value: number; positive: boolean };
  className?: string;
}

export function StatCard({ label, value, subtitle, icon: Icon, accent = 'primary', trend, className }: StatCardProps) {
  const styles = accentStyles[accent];

  return (
    <div
      className={cn(
        'group relative rounded-xl border bg-card p-5 card-interactive overflow-hidden',
        styles.border,
        styles.glow,
        className,
      )}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shimmer" />
      <div className="relative">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className={cn('rounded-lg p-2', styles.iconBg)}>
            <Icon className={cn('h-4 w-4', styles.iconText)} />
          </div>
        </div>
        <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{value}</p>
        {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
        {trend && (
          <div className={cn(
            'mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            trend.positive ? 'bg-[#2BD47D]/10 text-[#2BD47D]' : 'bg-[#E05A52]/10 text-[#E05A52]',
          )}>
            {trend.positive ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
    </div>
  );
}
