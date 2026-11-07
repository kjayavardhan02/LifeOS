export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const TASK_CATEGORIES = [
  'Personal',
  'Work',
  'Learning',
  'Finance',
  'Health',
  'Errands',
  'Shopping',
] as const;

export const TASK_STATUSES = ['todo', 'in_progress', 'done', 'cancelled'] as const;

export const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'Transport',
  'Rent',
  'Utilities',
  'Shopping',
  'Entertainment',
  'Health',
  'Education',
  'Subscriptions',
  'EMI',
  'Personal Care',
  'Travel',
  'Gifts',
  'Other',
] as const;

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Interest',
  'Cashback',
  'Gift',
  'Reimbursement',
  'Other',
] as const;

export const PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card',
  'Net Banking',
  'Wallet',
] as const;
