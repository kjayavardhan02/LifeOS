import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { PAYMENT_METHODS } from '@lifeos/shared';
import type {
  FinanceTransaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionType,
} from '@lifeos/shared';
import { useCategoryNames } from '@/hooks/use-categories';

interface TransactionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    input: CreateTransactionInput | (UpdateTransactionInput & { id: string }),
  ) => void;
  transaction?: FinanceTransaction | null;
}

function toLocalDatetime(dateStr: string): string {
  const d = new Date(dateStr);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function getNowLocal(): string {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export function TransactionDialog({
  open,
  onClose,
  onSubmit,
  transaction,
}: TransactionDialogProps) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [merchant, setMerchant] = useState('');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (transaction) {
      setAmount(String(transaction.amount));
      setType(transaction.type);
      setDate(toLocalDatetime(transaction.date));
      setCategory(transaction.category);
      setPaymentMethod(transaction.paymentMethod);
      setMerchant(transaction.merchant ?? '');
      setNotes(transaction.notes ?? '');
      setTagsInput(transaction.tags.join(', '));
    } else {
      setAmount('');
      setType('expense');
      setDate(getNowLocal());
      setCategory('');
      setPaymentMethod('UPI');
      setMerchant('');
      setNotes('');
      setTagsInput('');
    }
  }, [transaction, open]);

  const expenseCategories = useCategoryNames('expense');
  const incomeCategories = useCategoryNames('income');

  if (!open) return null;

  const categories =
    type === 'income'
      ? incomeCategories
      : type === 'expense'
        ? expenseCategories
        : [...new Set([...expenseCategories, ...incomeCategories])];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0 || !date || !category) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const base = {
      amount: parsedAmount,
      type,
      date: new Date(date).toISOString(),
      category,
      paymentMethod,
      merchant: merchant.trim() || undefined,
      notes: notes.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    };

    if (transaction) {
      onSubmit({ ...base, id: transaction.id });
    } else {
      onSubmit(base);
    }
  };

  const inputClass =
    'w-full rounded-md border border-border bg-input px-3 py-1.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary';
  const labelClass = 'block text-xs font-medium text-muted-foreground mb-1';

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 animate-overlay-in" onClick={onClose} />
      <div className="absolute inset-0 overflow-hidden flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full max-w-lg rounded-lg border border-border bg-card shadow-2xl flex flex-col overflow-hidden animate-dialog-in pointer-events-auto" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
          <div className="shrink-0 flex items-center justify-between border-b border-border bg-card px-4 py-2.5 rounded-t-lg">
            <h2 className="text-base font-semibold text-foreground">
              {transaction ? 'Edit Transaction' : 'New Transaction'}
            </h2>
            <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="px-4 py-3 space-y-2.5 overflow-y-auto flex-1 min-h-0 overscroll-contain">
              <div className="grid grid-cols-3 gap-1 rounded-lg border border-border p-1">
                {(['expense', 'income', 'transfer'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setType(t);
                      setCategory('');
                    }}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      type === t
                        ? t === 'income'
                          ? 'bg-success/15 text-success'
                          : t === 'expense'
                            ? 'bg-danger/15 text-danger'
                            : 'bg-primary/15 text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={labelClass}>Amount *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      {'₹'}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className={`${inputClass} pl-7`}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Date *</label>
                  <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Payment</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={inputClass}>
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>Category *</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} required>
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Merchant</label>
                  <input type="text" value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="Store, restaurant..." className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>Notes</label>
                  <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional details..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Tags</label>
                  <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="food, office..." className={inputClass} />
                </div>
              </div>
            </div>

            <div className="shrink-0 flex justify-end gap-3 px-4 py-2.5 border-t border-border rounded-b-lg">
              <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
              <button type="submit" className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors">
                {transaction ? 'Save Changes' : 'Add Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
