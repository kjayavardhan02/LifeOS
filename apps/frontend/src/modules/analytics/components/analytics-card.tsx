import { cn } from '@/lib/utils';

interface AnalyticsCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function AnalyticsCard({ title, subtitle, children, className }: AnalyticsCardProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card overflow-hidden card-interactive', className)}>
      <div className="px-5 pt-5 pb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      <div className="px-5 pb-5">{children}</div>
    </div>
  );
}
