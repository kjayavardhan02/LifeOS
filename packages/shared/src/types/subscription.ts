export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'trial' | 'expired';

export interface Subscription {
  id: string;
  name: string;
  provider?: string | null;
  amount: number;
  billingCycle: BillingCycle;
  nextRenewalDate: string;
  paymentMethod: string;
  category: string;
  status: SubscriptionStatus;
  startDate: string;
  notes?: string | null;
  url?: string | null;
  reminderDaysBefore: number[];
  monthlyEquivalent: number;
  yearlyTotal: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateSubscriptionInput {
  name: string;
  provider?: string;
  amount: number;
  billingCycle?: BillingCycle;
  nextRenewalDate: string;
  paymentMethod?: string;
  category?: string;
  status?: SubscriptionStatus;
  startDate: string;
  notes?: string;
  url?: string;
  reminderDaysBefore?: number[];
}

export interface UpdateSubscriptionInput {
  name?: string;
  provider?: string | null;
  amount?: number;
  billingCycle?: BillingCycle;
  nextRenewalDate?: string;
  paymentMethod?: string;
  category?: string;
  status?: SubscriptionStatus;
  notes?: string | null;
  url?: string | null;
  reminderDaysBefore?: number[];
}

export interface SubscriptionFilters {
  status?: SubscriptionStatus;
  category?: string;
  search?: string;
  billingCycle?: BillingCycle;
}

export interface SubscriptionSummary {
  totalMonthly: number;
  totalYearly: number;
  activeCount: number;
  upcomingRenewals: Subscription[];
  categoryBreakdown: { category: string; amount: number; count: number }[];
}
