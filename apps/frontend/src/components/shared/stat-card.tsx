import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type AccentColor = 'primary' | 'success' | 'warning' | 'danger' | 'info';

const accentStyles: Record<AccentColor, { border: string; iconBg: string; iconText: string; glow: string; gradient: string; stripColor: string }> = {
  primary: {
    border: 'border-[#5B9BF0]/15 hover:border-[#5B9BF0]/40',
    iconBg: 'bg-gradient-to-br from-[#5B9BF0]/20 to-[#5B9BF0]/5',
    iconText: 'text-[#5B9BF0]',
    glow: 'hover:shadow-[0_0_30px_rgba(91,155,240,0.12),0_8px_32px_rgba(0,0,0,0.3)]',
    gradient: 'from-[#5B9BF0]/8 via-transparent to-transparent',
    stripColor: 'from-[#5B9BF0] to-[#7BB3FF]',
  },
  success: {
    border: 'border-[#2BD47D]/15 hover:border-[#2BD47D]/40',
    iconBg: 'bg-gradient-to-br from-[#2BD47D]/20 to-[#2BD47D]/5',
    iconText: 'text-[#2BD47D]',
    glow: 'hover:shadow-[0_0_30px_rgba(43,212,125,0.12),0_8px_32px_rgba(0,0,0,0.3)]',
    gradient: 'from-[#2BD47D]/8 via-transparent to-transparent',
    stripColor: 'from-[#2BD47D] to-[#5EEAA0]',
  },
  warning: {
    border: 'border-[#F5C344]/15 hover:border-[#F5C344]/40',
    iconBg: 'bg-gradient-to-br from-[#F5C344]/20 to-[#F5C344]/5',
    iconText: 'text-[#F5C344]',
    glow: 'hover:shadow-[0_0_30px_rgba(245,195,68,0.12),0_8px_32px_rgba(0,0,0,0.3)]',
    gradient: 'from-[#F5C344]/8 via-transparent to-transparent',
    stripColor: 'from-[#F5C344] to-[#FFD97A]',
  },
  danger: {
    border: 'border-[#E05A52]/15 hover:border-[#E05A52]/40',
    iconBg: 'bg-gradient-to-br from-[#E05A52]/20 to-[#E05A52]/5',
    iconText: 'text-[#E05A52]',
    glow: 'hover:shadow-[0_0_30px_rgba(224,90,82,0.12),0_8px_32px_rgba(0,0,0,0.3)]',
    gradient: 'from-[#E05A52]/8 via-transparent to-transparent',
    stripColor: 'from-[#E05A52] to-[#F08080]',
  },
  info: {
    border: 'border-[#E89B6E]/15 hover:border-[#E89B6E]/40',
    iconBg: 'bg-gradient-to-br from-[#E89B6E]/20 to-[#E89B6E]/5',
    iconText: 'text-[#E89B6E]',
    glow: 'hover:shadow-[0_0_30px_rgba(232,155,110,0.12),0_8px_32px_rgba(0,0,0,0.3)]',
    gradient: 'from-[#E89B6E]/8 via-transparent to-transparent',
    stripColor: 'from-[#E89B6E] to-[#F5C7A0]',
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
        'group relative rounded-xl border bg-card p-5 card-interactive card-shine overflow-hidden',
        styles.border,
        styles.glow,
        className,
      )}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none', styles.gradient)} />
      <div className={cn('absolute left-0 top-0 h-full w-[2px] rounded-full bg-gradient-to-b', styles.stripColor)} />

      <div className="relative">
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <div className={cn('rounded-xl p-2.5 ring-1 ring-white/5', styles.iconBg)}>
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
