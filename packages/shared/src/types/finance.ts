export type TransactionType = 'income' | 'expense' | 'transfer';

export interface FinanceTransaction {
  id: string;
  amount: number;
  type: TransactionType;
  date: string;
  category: string;
  subcategory?: string | null;
  paymentMethod: string;
  merchant?: string | null;
  notes?: string | null;
  tags: string[];
  isRecurring: boolean;
  recurringId?: string | null;
  refundOfId?: string | null;
  subscriptionId?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateTransactionInput {
  amount: number;
  type: TransactionType;
  date: string;
  category: string;
  subcategory?: string;
  paymentMethod?: string;
  merchant?: string;
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringId?: string;
  refundOfId?: string;
  subscriptionId?: string;
}

export interface UpdateTransactionInput {
  amount?: number;
  type?: TransactionType;
  date?: string;
  category?: string;
  subcategory?: string | null;
  paymentMethod?: string;
  merchant?: string | null;
  notes?: string | null;
  tags?: string[];
}

export interface TransactionFilters {
  type?: TransactionType;
  category?: string;
  paymentMethod?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  tags?: string[];
}

export interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  subcategory?: string | null;
  paymentMethod: string;
  merchant?: string | null;
  notes?: string | null;
  tags: string[];
  recurrencePattern: string;
  nextRunDate: string;
  endDate?: string | null;
  isActive: boolean;
  lastRunAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringTransactionInput {
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  subcategory?: string;
  paymentMethod?: string;
  merchant?: string;
  notes?: string;
  tags?: string[];
  recurrencePattern: string;
  nextRunDate: string;
  endDate?: string;
}

export interface UpdateRecurringTransactionInput {
  title?: string;
  amount?: number;
  type?: TransactionType;
  category?: string;
  subcategory?: string | null;
  paymentMethod?: string;
  merchant?: string | null;
  notes?: string | null;
  tags?: string[];
  recurrencePattern?: string;
  nextRunDate?: string;
  endDate?: string | null;
  isActive?: boolean;
}

export interface Budget {
  id: string;
  category: string | null;
  amount: number;
  month: number;
  year: number;
  spent?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetInput {
  category?: string | null;
  amount: number;
  month: number;
  year: number;
}

export interface UpdateBudgetInput {
  amount?: number;
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  savings: number;
  savingsRate: number;
  categoryBreakdown: { category: string; amount: number; percentage: number }[];
  dailyTrend: { date: string; income: number; expense: number }[];
}
