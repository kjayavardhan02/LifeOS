export type DocumentStorageType = 'local' | 'external';

export interface DocumentFile {
  id: string;
  documentId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  version: number;
  label: string | null;
  uploadedAt: string;
}

export interface DocumentFolderEntry {
  folder: string;
  count: number;
}

export interface Document {
  id: string;
  name: string;
  description: string | null;
  category: string;
  folder: string;
  tags: string[];
  documentNumber: string | null;
  issuer: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  notes: string | null;
  storageType: DocumentStorageType;
  externalUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  files: DocumentFile[];
}

export interface CreateDocumentInput {
  name: string;
  description?: string;
  category?: string;
  folder?: string;
  tags?: string[];
  documentNumber?: string;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  notes?: string;
  storageType?: DocumentStorageType;
  externalUrl?: string;
}

export interface UpdateDocumentInput {
  name?: string;
  description?: string | null;
  category?: string;
  folder?: string;
  tags?: string[];
  documentNumber?: string | null;
  issuer?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  notes?: string | null;
  externalUrl?: string | null;
}

export interface DocumentFilters {
  category?: string;
  folder?: string;
  storageType?: DocumentStorageType;
  tags?: string[];
  search?: string;
  expiryStatus?: 'all' | 'expiring_soon' | 'expired';
  expiryDateFrom?: string;
  expiryDateTo?: string;
}

export interface DocumentStats {
  total: number;
  byCategory: { category: string; count: number }[];
  expiringSoon: number;
  expired: number;
  storageUsed: number;
}
