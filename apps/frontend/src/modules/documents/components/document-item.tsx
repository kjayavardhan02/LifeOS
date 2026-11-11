import { FileText, Globe, HardDrive, AlertTriangle, Clock, Files } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Document } from '@lifeos/shared';

interface DocumentItemProps {
  document: Document;
  onClick: (doc: Document) => void;
}

function getExpiryInfo(expiryDate: string | null): { label: string; className: string } | null {
  if (!expiryDate) return null;
  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) return { label: 'Expired', className: 'text-danger' };
  if (daysUntil <= 30) return { label: `${daysUntil}d left`, className: 'text-warning' };
  return { label: 'Valid', className: 'text-success' };
}

export function DocumentItem({ document, onClick }: DocumentItemProps) {
  const expiry = getExpiryInfo(document.expiryDate);
  const StorageIcon = document.storageType === 'external' ? Globe : HardDrive;

  return (
    <button
      onClick={() => onClick(document)}
      className="flex w-full items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:border-border-hover hover:bg-card-hover"
    >
      <FileText className="h-5 w-5 shrink-0 text-primary" />

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium text-foreground">{document.name}</h3>
        {document.description && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{document.description}</p>
        )}
      </div>

      <span className="hidden shrink-0 rounded bg-card-hover px-1.5 py-0.5 text-xs text-muted-foreground sm:inline-block">
        {document.category}
      </span>

      {document.files.length > 0 && (
        <span className="hidden shrink-0 items-center gap-1 text-xs text-muted sm:flex">
          <Files className="h-3 w-3" />
          {document.files.length}
        </span>
      )}

      {expiry && (
        <span className={cn('hidden shrink-0 text-xs sm:inline-block', expiry.className)}>
          {expiry.label}
        </span>
      )}

      {document.expiryDate && (
        <span className="hidden shrink-0 text-xs text-muted lg:inline-block">
          {format(new Date(document.expiryDate), 'MMM d, yyyy')}
        </span>
      )}

      <StorageIcon className="h-4 w-4 shrink-0 text-muted" />
    </button>
  );
}
