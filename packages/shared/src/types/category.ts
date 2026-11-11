export type CategoryType =
  | 'expense'
  | 'income'
  | 'task'
  | 'event'
  | 'reminder'
  | 'subscription'
  | 'project'
  | 'knowledge'
  | 'document';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  isDefault: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface CreateCategoryInput {
  name: string;
  type: CategoryType;
}
