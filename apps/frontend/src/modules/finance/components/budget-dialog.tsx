import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Budget, CreateBudgetInput, UpdateBudgetInput } from '@lifeos/shared';
import { useCategoryNames } from '@/hooks/use-categories';

interface BudgetDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    input: CreateBudgetInput | (UpdateBudgetInput & { id: string }),
  ) => void;
  budget?: Budget | null;
  month: number;
  year: number;
}

export function BudgetDialog({
  open,
  onClose,
  onSubmit,
  budget,
  month,
  year,
}: BudgetDialogProps) {
  const [category, setCategory] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [isOverall, setIsOverall] = useState(false);

  useEffect(() => {
    if (budget) {
      setCategory(budget.category ?? '');
      setAmount(String(budget.amount));
      setIsOverall(!budget.category);
    } else {
      setCategory('');
      setAmount('');
      setIsOverall(false);
    }
  }, [budget, open]);

  const expenseCategories = useCategoryNames('expense');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;
    if (!isOverall && !category) return;

    if (budget) {
      onSubmit({ amount: parsedAmount, id: budget.id });
    } else {
      onSubmit({
        category: isOverall ? null : category,
        amount: parsedAmount,
        month,
        year,
      });
    }
  };

  const inputClass =
    'w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary';
  const selectClass =
    'w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-primary';
  const labelClass = 'block text-xs font-medium text-muted-foreground mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 animate-overlay-in" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl animate-dialog-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">
            {budget ? 'Edit Budget' : 'New Budget'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!budget && (
            <div className="flex items-center gap-3 rounded-md border border-border p-3">
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOverall}
                  onChange={(e) => {
                    setIsOverall(e.target.checked);
                    if (e.target.checked) setCategory('');
                  }}
                  className="rounded border-border"
                />
                Overall budget (all categories)
              </label>
            </div>
          )}

          {!budget && !isOverall && (
            <div>
              <label className={labelClass}>Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={selectClass}
                required={!isOverall}
              >
                <option value="">Select category</option>
                {expenseCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={labelClass}>Budget Amount *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {'₹'}
              </span>
              <input
                type="number"
                step="1"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className={`${inputClass} pl-7`}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
            >
              {budget ? 'Save Changes' : 'Create Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
