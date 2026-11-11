import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { X, Edit2, Trash2, Calendar, Tag, CreditCard, Globe, FileText, Bell, Clock, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpdateSubscription, useDeleteSubscription } from '../hooks/use-subscriptions';
import type { Subscription, SubscriptionStatus, BillingCycle } from '@lifeos/shared';

interface SubscriptionDetailPanelProps {
  subscription: Subscription | null;
  transactions?: unknown[];
  onClose: () => void;
}

const statusLabels: Record<SubscriptionStatus, { text: string; color: string }> = {
  active: { text: 'Active', color: 'text-success' },
  paused: { text: 'Paused', color: 'text-warning' },
  cancelled: { text: 'Cancelled', color: 'text-danger' },
  trial: { text: 'Trial', color: 'text-primary' },
  expired: { text: 'Expired', color: 'text-muted-foreground' },
};

const BILLING_CYCLE_LABELS: Record<string, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

function formatCurrency(value: number): string {
  return value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

interface TransactionRecord {
  id: string;
  amount: number;
  date: string;
  category: string;
}

export function SubscriptionDetailPanel({ subscription, transactions, onClose }: SubscriptionDetailPanelProps) {
  const updateSubscription = useUpdateSubscription();
  const deleteSubscription = useDeleteSubscription();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editProvider, setEditProvider] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editBillingCycle, setEditBillingCycle] = useState<BillingCycle>('monthly');
  const [editNextRenewalDate, setEditNextRenewalDate] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editStatus, setEditStatus] = useState<SubscriptionStatus>('active');
  const [editNotes, setEditNotes] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editReminderDaysBefore, setEditReminderDaysBefore] = useState('');

  useEffect(() => {
    if (subscription) {
      setEditName(subscription.name);
      setEditProvider(subscription.provider ?? '');
      setEditAmount(subscription.amount.toString());
      setEditBillingCycle(subscription.billingCycle);
      setEditNextRenewalDate(subscription.nextRenewalDate.slice(0, 10));
      setEditPaymentMethod(subscription.paymentMethod);
      setEditCategory(subscription.category);
      setEditStatus(subscription.status);
      setEditNotes(subscription.notes ?? '');
      setEditUrl(subscription.url ?? '');
      setEditReminderDaysBefore(subscription.reminderDaysBefore.join(', '));
      setIsEditing(false);
    }
  }, [subscription]);

  if (!subscription) return null;

  const statusInfo = statusLabels[subscription.status];
  const txList = (transactions ?? []) as TransactionRecord[];

  const handleDelete = () => {
    deleteSubscription.mutate(subscription.id);
    onClose();
  };

  const handleSave = () => {
    if (!editName.trim()) return;
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) return;
    const reminderDays = editReminderDaysBefore
      .split(',')
      .map((d) => parseInt(d.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0);
    updateSubscription.mutate(
      {
        id: subscription.id,
        name: editName.trim(),
        provider: editProvider || null,
        amount,
        billingCycle: editBillingCycle,
        nextRenewalDate: new Date(editNextRenewalDate).toISOString(),
        paymentMethod: editPaymentMethod,
        category: editCategory,
        status: editStatus,
        notes: editNotes || null,
        url: editUrl || null,
        reminderDaysBefore: reminderDays,
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
            <span className={cn('text-xs font-medium', statusInfo.color)}>{statusInfo.text}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                title="Edit subscription"
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
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Name</label>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Provider</label>
                    <input type="text" value={editProvider} onChange={(e) => setEditProvider(e.target.value)} className={inputClass} placeholder="Optional" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Amount</label>
                    <input type="number" step="0.01" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Billing Cycle</label>
                    <select value={editBillingCycle} onChange={(e) => setEditBillingCycle(e.target.value as BillingCycle)} className={inputClass}>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Next Renewal Date</label>
                    <input type="date" value={editNextRenewalDate} onChange={(e) => setEditNextRenewalDate(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Payment Method</label>
                    <input type="text" value={editPaymentMethod} onChange={(e) => setEditPaymentMethod(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Category</label>
                    <input type="text" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Status</label>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as SubscriptionStatus)} className={inputClass}>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="trial">Trial</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">URL</label>
                  <input type="url" value={editUrl} onChange={(e) => setEditUrl(e.target.value)} className={inputClass} placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Notes</label>
                  <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} className={inputClass + ' resize-none'} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Reminder Days Before</label>
                  <input type="text" value={editReminderDaysBefore} onChange={(e) => setEditReminderDaysBefore(e.target.value)} className={inputClass} placeholder="1, 3, 7" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={!editName.trim() || !editAmount || parseFloat(editAmount) <= 0}
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
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{subscription.name}</h2>
                  {subscription.provider && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{subscription.provider}</p>
                  )}
                </div>

                {/* Amount breakdown */}
                <div className="rounded-md border border-border bg-background p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Billing</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {'₹'}{formatCurrency(subscription.amount)}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {BILLING_CYCLE_LABELS[subscription.billingCycle]}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                    <span>{'₹'}{formatCurrency(subscription.monthlyEquivalent)}/month</span>
                    <span>{'₹'}{formatCurrency(subscription.yearlyTotal)}/year</span>
                  </div>
                </div>

                {/* Next renewal */}
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="text-sm">
                    <div className="text-foreground">
                      Next renewal: {format(new Date(subscription.nextRenewalDate), 'EEEE, MMMM d, yyyy')}
                    </div>
                  </div>
                </div>

                {/* Start date */}
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="text-sm text-foreground">
                    Started: {format(new Date(subscription.startDate), 'MMMM d, yyyy')}
                  </div>
                </div>

                {/* Category */}
                <div className="flex items-start gap-3">
                  <Tag className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="rounded bg-card-hover px-2 py-0.5 text-sm text-foreground">
                    {subscription.category}
                  </span>
                </div>

                {/* Payment method */}
                <div className="flex items-start gap-3">
                  <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm text-foreground">{subscription.paymentMethod}</span>
                </div>

                {/* URL */}
                {subscription.url && (
                  <div className="flex items-start gap-3">
                    <Globe className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <a
                      href={subscription.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline truncate"
                    >
                      {subscription.url}
                    </a>
                  </div>
                )}

                {/* Reminder settings */}
                {subscription.reminderDaysBefore && subscription.reminderDaysBefore.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Bell className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      Remind {subscription.reminderDaysBefore.join(', ')} {subscription.reminderDaysBefore.length === 1 && subscription.reminderDaysBefore[0] === 1 ? 'day' : 'days'} before
                    </span>
                  </div>
                )}

                {/* Notes */}
                {subscription.notes && (
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="rounded-md border border-border bg-background p-3 flex-1">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{subscription.notes}</p>
                    </div>
                  </div>
                )}

                {/* Payment history */}
                {txList.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Payment History</h3>
                    <div className="space-y-2">
                      {txList.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between rounded-md border border-border bg-background p-3">
                          <span className="text-sm text-foreground">
                            {format(new Date(tx.date), 'MMM d, yyyy')}
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {'₹'}{formatCurrency(tx.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Delete */}
            <div className="pt-4 border-t border-border">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete Subscription
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
