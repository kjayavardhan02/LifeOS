import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { SUBSCRIPTION_STATUSES, BILLING_CYCLES, PAYMENT_METHODS } from '@lifeos/shared';
import type { Subscription, CreateSubscriptionInput, UpdateSubscriptionInput, BillingCycle, SubscriptionStatus } from '@lifeos/shared';
import { useCategoryNames } from '@/hooks/use-categories';

const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

const REMINDER_DAY_OPTIONS = [1, 3, 7];

interface SubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateSubscriptionInput | (UpdateSubscriptionInput & { id: string })) => void;
  subscription?: Subscription | null;
}

function toLocalDate(dateStr: string): string {
  const d = new Date(dateStr);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

function getTodayDate(): string {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

function getDefaultRenewalDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

export function SubscriptionDialog({ open, onClose, onSubmit, subscription }: SubscriptionDialogProps) {
  const subscriptionCategories = useCategoryNames('subscription');
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [nextRenewalDate, setNextRenewalDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [category, setCategory] = useState('Other');
  const [status, setStatus] = useState<SubscriptionStatus>('active');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [reminderDays, setReminderDays] = useState<number[]>([3]);

  useEffect(() => {
    if (subscription) {
      setName(subscription.name);
      setProvider(subscription.provider ?? '');
      setAmount(String(subscription.amount));
      setBillingCycle(subscription.billingCycle);
      setNextRenewalDate(toLocalDate(subscription.nextRenewalDate));
      setStartDate(toLocalDate(subscription.startDate));
      setPaymentMethod(subscription.paymentMethod);
      setCategory(subscription.category);
      setStatus(subscription.status);
      setUrl(subscription.url ?? '');
      setNotes(subscription.notes ?? '');
      setReminderDays(subscription.reminderDaysBefore ?? [3]);
    } else {
      setName('');
      setProvider('');
      setAmount('');
      setBillingCycle('monthly');
      setNextRenewalDate(getDefaultRenewalDate());
      setStartDate(getTodayDate());
      setPaymentMethod('UPI');
      setCategory('Other');
      setStatus('active');
      setUrl('');
      setNotes('');
      setReminderDays([3]);
    }
  }, [subscription, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount || !nextRenewalDate || !startDate) return;

    const base = {
      name: name.trim(),
      provider: provider.trim() || undefined,
      amount: parseFloat(amount),
      billingCycle,
      nextRenewalDate: new Date(nextRenewalDate + 'T00:00:00').toISOString(),
      startDate: new Date(startDate + 'T00:00:00').toISOString(),
      paymentMethod,
      category,
      status,
      url: url.trim() || undefined,
      notes: notes.trim() || undefined,
      reminderDaysBefore: reminderDays,
    };

    if (subscription) {
      onSubmit({ ...base, id: subscription.id });
    } else {
      onSubmit(base);
    }
  };

  const toggleReminderDay = (day: number) => {
    setReminderDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b),
    );
  };

  const inputClass = 'w-full rounded-md border border-border bg-input px-3 py-1.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary';
  const labelClass = 'block text-xs font-medium text-muted-foreground mb-1';

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 animate-overlay-in" onClick={onClose} />
      <div className="absolute inset-0 overflow-hidden flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full max-w-lg rounded-lg border border-border bg-card shadow-2xl flex flex-col overflow-hidden animate-dialog-in pointer-events-auto" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
          <div className="shrink-0 flex items-center justify-between border-b border-border bg-card px-4 py-2.5 rounded-t-lg">
            <h2 className="text-base font-semibold text-foreground">
              {subscription ? 'Edit Subscription' : 'New Subscription'}
            </h2>
            <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="px-4 py-3 space-y-2.5 overflow-y-auto flex-1 min-h-0 overscroll-contain">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>Name *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Netflix" className={inputClass} autoFocus required />
                </div>
                <div>
                  <label className={labelClass}>Provider</label>
                  <input type="text" value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="e.g. Netflix Inc." className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={labelClass}>Amount *</label>
                  <input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Cycle</label>
                  <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value as BillingCycle)} className={inputClass}>
                    {BILLING_CYCLES.map((c) => (
                      <option key={c} value={c}>{BILLING_CYCLE_LABELS[c]}</option>
                    ))}
                  </select>
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
                  <label className={labelClass}>Start Date *</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Next Renewal *</label>
                  <input type="date" value={nextRenewalDate} onChange={(e) => setNextRenewalDate(e.target.value)} className={inputClass} required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={labelClass}>Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                    {subscriptionCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as SubscriptionStatus)} className={inputClass}>
                    {SUBSCRIPTION_STATUSES.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>URL</label>
                  <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Notes</label>
                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes..." className={inputClass} />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground">Remind:</span>
                {REMINDER_DAY_OPTIONS.map((day) => (
                  <label key={day} className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminderDays.includes(day)}
                      onChange={() => toggleReminderDay(day)}
                      className="rounded border-border"
                    />
                    {day}d
                  </label>
                ))}
              </div>
            </div>

            <div className="shrink-0 flex justify-end gap-3 px-4 py-2.5 border-t border-border rounded-b-lg">
              <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
              <button type="submit" className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors">
                {subscription ? 'Save Changes' : 'Add Subscription'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
