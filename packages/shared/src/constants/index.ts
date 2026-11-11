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

export const EVENT_CATEGORIES = [
  'Meeting',
  'Personal',
  'Birthday',
  'Holiday',
  'Deadline',
  'Appointment',
] as const;

export const EVENT_CATEGORY_COLORS: Record<string, string> = {
  Meeting: '#4E85DE',
  Personal: '#22A06B',
  Birthday: '#DE8863',
  Holiday: '#F4B942',
  Deadline: '#C04741',
  Appointment: '#A6A39F',
} as const;

export const REMINDER_OPTIONS = [
  { value: 0, label: 'At time of event' },
  { value: 5, label: '5 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
] as const;

export const REMINDER_CATEGORIES = [
  'Bill Payment',
  'Subscription Renewal',
  'Birthday',
  'Anniversary',
  'Document Expiry',
  'Deadline',
  'Custom',
] as const;

export const REMINDER_STATUSES = ['pending', 'snoozed', 'done', 'dismissed'] as const;

export const TRANSACTION_TYPES = ['income', 'expense', 'transfer'] as const;

export const BILLING_CYCLES = ['monthly', 'quarterly', 'yearly'] as const;

export const SUBSCRIPTION_STATUSES = ['active', 'paused', 'cancelled', 'trial', 'expired'] as const;

export const SUBSCRIPTION_CATEGORIES = [
  'Streaming',
  'Software/Tools',
  'Cloud/Storage',
  'News/Media',
  'Health/Fitness',
  'Education',
  'Gaming',
  'Other',
] as const;

export const SNOOZE_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 60, label: '1 hour' },
  { value: 180, label: '3 hours' },
  { value: 1440, label: 'Tomorrow' },
  { value: 4320, label: '3 days' },
  { value: 10080, label: '1 week' },
] as const;

export const PROJECT_STATUSES = ['planning', 'active', 'on_hold', 'completed', 'archived'] as const;

export const MILESTONE_STATUSES = ['pending', 'in_progress', 'completed'] as const;

export const PROJECT_COLORS = [
  '#4E85DE', '#DE8863', '#22A06B', '#F4B942', '#C04741',
  '#9B59B6', '#1ABC9C', '#E74C3C', '#3498DB', '#2ECC71',
] as const;

export const KNOWLEDGE_VIEWS = ['grid', 'list'] as const;

export const DOCUMENT_CATEGORIES = [
  'Identity',
  'Education',
  'Employment',
  'Financial',
  'Insurance',
  'Property',
  'Medical',
  'Warranties & Invoices',
  'Contracts & Legal',
  'Other',
] as const;

export const DOCUMENT_STORAGE_TYPES = ['local', 'external'] as const;

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const;
