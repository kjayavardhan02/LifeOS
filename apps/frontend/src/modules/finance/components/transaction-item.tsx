import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FinanceTransaction } from '@lifeos/shared';

interface TransactionItemProps {
  transaction: FinanceTransaction;
  onEdit: (transaction: FinanceTransaction) => void;
  onDelete: (id: string) => void;
  onClick?: (transaction: FinanceTransaction) => void;
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const typeConfig = {
  income: {
    icon: ArrowUpRight,
    colorClass: 'text-success',
    bgClass: 'bg-success/10',
    borderClass: 'border-success/30',
    sign: '+',
  },
  expense: {
    icon: ArrowDownRight,
    colorClass: 'text-danger',
    bgClass: 'bg-danger/10',
    borderClass: 'border-danger/30',
    sign: '-',
  },
  transfer: {
    icon: ArrowLeftRight,
    colorClass: 'text-primary',
    bgClass: 'bg-primary/10',
    borderClass: 'border-primary/30',
    sign: '',
  },
};

export function TransactionItem({ transaction, onEdit, onDelete, onClick }: TransactionItemProps) {
  const config = typeConfig[transaction.type];
  const Icon = config.icon;

  return (
    <div
      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:bg-card-hover/50 hover:border-border-hover cursor-pointer"
      onClick={() => onClick?.(transaction)}
    >
      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', config.bgClass)}>
        <Icon className={cn('h-4 w-4', config.colorClass)} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">
            {transaction.merchant || transaction.category}
          </span>
          {transaction.merchant && (
            <span className="rounded bg-card-hover px-1.5 py-0.5 text-xs text-muted-foreground shrink-0">
              {transaction.category}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
          {transaction.paymentMethod && (
            <>
              <span className="text-muted">|</span>
              <span>{transaction.paymentMethod}</span>
            </>
          )}
          {transaction.tags.length > 0 && (
            <>
              <span className="text-muted">|</span>
              <span className="truncate">{transaction.tags.join(', ')}</span>
            </>
          )}
        </div>
      </div>

      <span className={cn('text-sm font-semibold tabular-nums shrink-0', config.colorClass)}>
        {config.sign}{formatCurrency(transaction.amount)}
      </span>

      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(transaction); }}
          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          title="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(transaction.id); }}
          className="rounded-md p-1.5 text-muted-foreground hover:text-danger transition-colors"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
