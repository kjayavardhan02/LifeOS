import { Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Budget } from '@lifeos/shared';

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const spent = budget.spent ?? 0;
  const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
  const clampedPercentage = Math.min(percentage, 100);

  const barColor =
    percentage > 80
      ? 'bg-danger'
      : percentage > 50
        ? 'bg-warning'
        : 'bg-success';

  const textColor =
    percentage > 80
      ? 'text-danger'
      : percentage > 50
        ? 'text-warning'
        : 'text-success';

  return (
    <div className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-border-hover">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">
            {budget.category ?? 'Overall Budget'}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatCurrency(spent)} of {formatCurrency(budget.amount)}
          </p>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(budget)}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            title="Edit budget"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(budget.id)}
            className="rounded-md p-1.5 text-muted-foreground hover:text-danger transition-colors"
            title="Delete budget"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3">
        <div className="h-2 w-full rounded-full bg-border">
          <div
            className={cn('h-2 rounded-full animate-progress', barColor)}
            style={{ width: `${clampedPercentage}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <span className={cn('text-xs font-medium', textColor)}>
            {percentage.toFixed(0)}% used
          </span>
          <span className="text-xs text-muted-foreground">
            {formatCurrency(Math.max(budget.amount - spent, 0))} left
          </span>
        </div>
      </div>
    </div>
  );
}
