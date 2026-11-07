import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  className?: string;
}

export function StatCard({ label, value, subtitle, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-5 transition-colors hover:border-border-hover',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}
          {trend && (
            <p
              className={cn(
                'mt-1 text-xs font-medium',
                trend.positive ? 'text-success' : 'text-danger',
              )}
            >
              {trend.positive ? '+' : ''}
              {trend.value}%
            </p>
          )}
        </div>
        <Icon className="h-5 w-5 text-muted" />
      </div>
    </div>
  );
}
