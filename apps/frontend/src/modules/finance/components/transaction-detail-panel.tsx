import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { X, Edit2, Trash2, ArrowUpRight, ArrowDownRight, ArrowLeftRight, IndianRupee, Tag, CreditCard, Calendar, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpdateTransaction, useDeleteTransaction } from '../hooks/use-transactions';
import type { FinanceTransaction, TransactionType } from '@lifeos/shared';

interface TransactionDetailPanelProps {
  transaction: FinanceTransaction | null;
  onClose: () => void;
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const typeConfig: Record<TransactionType, { icon: typeof ArrowUpRight; colorClass: string; bgClass: string; label: string; sign: string }> = {
  income: { icon: ArrowUpRight, colorClass: 'text-success', bgClass: 'bg-success/10', label: 'Income', sign: '+' },
  expense: { icon: ArrowDownRight, colorClass: 'text-danger', bgClass: 'bg-danger/10', label: 'Expense', sign: '-' },
  transfer: { icon: ArrowLeftRight, colorClass: 'text-primary', bgClass: 'bg-primary/10', label: 'Transfer', sign: '' },
};

export function TransactionDetailPanel({ transaction, onClose }: TransactionDetailPanelProps) {
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState<TransactionType>('expense');
  const [editDate, setEditDate] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSubcategory, setEditSubcategory] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState('');
  const [editMerchant, setEditMerchant] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editTags, setEditTags] = useState('');

  useEffect(() => {
    if (transaction) {
      setEditAmount(transaction.amount.toString());
      setEditType(transaction.type);
      setEditDate(transaction.date.slice(0, 10));
      setEditCategory(transaction.category);
      setEditSubcategory(transaction.subcategory ?? '');
      setEditPaymentMethod(transaction.paymentMethod);
      setEditMerchant(transaction.merchant ?? '');
      setEditNotes(transaction.notes ?? '');
      setEditTags(transaction.tags.join(', '));
      setIsEditing(false);
    }
  }, [transaction]);

  if (!transaction) return null;

  const config = typeConfig[transaction.type];
  const Icon = config.icon;

  const handleDelete = () => {
    deleteTransaction.mutate(transaction.id);
    onClose();
  };

  const handleSave = () => {
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) return;
    const tagList = editTags.split(',').map((t) => t.trim()).filter(Boolean);
    updateTransaction.mutate(
      {
        id: transaction.id,
        amount,
        type: editType,
        date: new Date(editDate).toISOString(),
        category: editCategory,
        subcategory: editSubcategory || null,
        paymentMethod: editPaymentMethod,
        merchant: editMerchant || null,
        notes: editNotes || null,
        tags: tagList,
      },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  const inputClass =
    'w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary';

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 animate-overlay-in" onClick={onClose} />
      <div className="absolute inset-0 overflow-hidden flex items-center justify-center p-6 pointer-events-none">
        <div className="relative w-full max-w-2xl rounded-lg border border-border bg-card shadow-2xl flex flex-col animate-dialog-in pointer-events-auto" style={{ maxHeight: 'calc(100vh - 3rem)' }}>
          <div className="shrink-0 flex items-center justify-between border-b border-border bg-card px-5 py-4 rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', config.bgClass)}>
                <Icon className={cn('h-4 w-4', config.colorClass)} />
              </div>
              <span className={cn('text-xs font-medium', config.colorClass)}>{config.label}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                title="Edit transaction"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-5 overflow-y-auto flex-1 min-h-0 overscroll-contain">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Amount</label>
                    <input type="number" step="0.01" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Type</label>
                    <select value={editType} onChange={(e) => setEditType(e.target.value as TransactionType)} className={inputClass}>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                      <option value="transfer">Transfer</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Date</label>
                  <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Category</label>
                    <input type="text" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Subcategory</label>
                    <input type="text" value={editSubcategory} onChange={(e) => setEditSubcategory(e.target.value)} className={inputClass} placeholder="Optional" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Payment Method</label>
                    <input type="text" value={editPaymentMethod} onChange={(e) => setEditPaymentMethod(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Merchant</label>
                    <input type="text" value={editMerchant} onChange={(e) => setEditMerchant(e.target.value)} className={inputClass} placeholder="Optional" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Notes</label>
                  <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} className={inputClass + ' resize-none'} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Tags</label>
                  <input type="text" value={editTags} onChange={(e) => setEditTags(e.target.value)} className={inputClass} placeholder="tag1, tag2" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={!editAmount || parseFloat(editAmount) <= 0}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Amount */}
                <div className="text-center">
                  <div className={cn('text-3xl font-bold', config.colorClass)}>
                    {config.sign}{'₹'}{formatCurrency(transaction.amount)}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {transaction.merchant || transaction.category}
                  </p>
                </div>

                {/* Date */}
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    {format(new Date(transaction.date), 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>

                {/* Category / Subcategory */}
                <div className="flex items-start gap-3">
                  <Tag className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex items-center gap-2 text-sm">
                    <span className="rounded bg-card-hover px-2 py-0.5 text-foreground">{transaction.category}</span>
                    {transaction.subcategory && (
                      <span className="rounded bg-card-hover px-2 py-0.5 text-muted-foreground">{transaction.subcategory}</span>
                    )}
                  </div>
                </div>

                {/* Payment method */}
                <div className="flex items-start gap-3">
                  <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm text-foreground">{transaction.paymentMethod}</span>
                </div>

                {/* Merchant */}
                {transaction.merchant && (
                  <div className="flex items-start gap-3">
                    <IndianRupee className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm text-foreground">{transaction.merchant}</span>
                  </div>
                )}

                {/* Tags */}
                {transaction.tags.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {transaction.tags.map((tag) => (
                        <span key={tag} className="rounded bg-card-hover px-2 py-0.5 text-xs text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {transaction.notes && (
                  <div>
                    <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Notes</h3>
                    <div className="rounded-md border border-border bg-background p-3">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{transaction.notes}</p>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="text-xs text-muted space-y-1">
                  <p>Created {format(new Date(transaction.createdAt), 'MMM d, yyyy h:mm a')}</p>
                  {transaction.isRecurring && <p className="text-primary">Recurring transaction</p>}
                </div>
              </>
            )}

            {/* Delete */}
            <div className="pt-4 border-t border-border">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete Transaction
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
