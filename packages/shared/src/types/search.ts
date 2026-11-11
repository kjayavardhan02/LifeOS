export type SearchModule =
  | 'tasks'
  | 'transactions'
  | 'events'
  | 'reminders'
  | 'projects'
  | 'notes'
  | 'documents'
  | 'subscriptions';

export interface SearchTaskResult {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  updatedAt: string;
}

export interface SearchTransactionResult {
  id: string;
  amount: number;
  type: string;
  category: string;
  merchant: string | null;
  date: string;
}

export interface SearchEventResult {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
}

export interface SearchReminderResult {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  status: string;
}

export interface SearchProjectResult {
  id: string;
  name: string;
  description: string | null;
  status: string;
  updatedAt: string;
}

export interface SearchNoteResult {
  id: string;
  title: string;
  content: string | null;
  folder: string;
  updatedAt: string;
}

export interface SearchDocumentResult {
  id: string;
  name: string;
  description: string | null;
  category: string;
  updatedAt: string;
}

export interface SearchSubscriptionResult {
  id: string;
  name: string;
  provider: string | null;
  amount: number;
  status: string;
  nextBillingDate: string;
}

export interface SearchResults {
  tasks: SearchTaskResult[];
  transactions: SearchTransactionResult[];
  events: SearchEventResult[];
  reminders: SearchReminderResult[];
  projects: SearchProjectResult[];
  notes: SearchNoteResult[];
  documents: SearchDocumentResult[];
  subscriptions: SearchSubscriptionResult[];
  totalCount: number;
}

export interface SearchQuery {
  q: string;
  module?: SearchModule;
  sortBy?: 'relevance' | 'date';
  limit?: number;
}
