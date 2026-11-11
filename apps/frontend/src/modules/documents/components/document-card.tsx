import { FileText, Globe, HardDrive, AlertTriangle, Clock, Files } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Document } from '@lifeos/shared';

interface DocumentCardProps {
  document: Document;
  onClick: (doc: Document) => void;
}

function getExpiryInfo(expiryDate: string | null): { label: string; className: string; icon: typeof AlertTriangle | null } | null {
  if (!expiryDate) return null;
  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) {
    return { label: 'Expired', className: 'text-danger', icon: AlertTriangle };
  }
  if (daysUntil <= 30) {
    return { label: `Expires in ${daysUntil}d`, className: 'text-warning', icon: Clock };
  }
  return { label: `Valid`, className: 'text-success', icon: null };
}

export function DocumentCard({ document, onClick }: DocumentCardProps) {
  const expiry = getExpiryInfo(document.expiryDate);
  const StorageIcon = document.storageType === 'external' ? Globe : HardDrive;

  return (
    <button
      onClick={() => onClick(document)}
      className="flex w-full flex-col rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-border-hover hover:bg-card-hover"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-5 w-5 shrink-0 text-primary" />
          <h3 className="truncate text-sm font-medium text-foreground">{document.name}</h3>
        </div>
        <span title={document.storageType === 'external' ? 'External Link' : 'Local File'}>
          <StorageIcon className="h-4 w-4 shrink-0 text-muted" />
        </span>
      </div>

      {document.description && (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{document.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded bg-card-hover px-1.5 py-0.5 text-xs text-muted-foreground">
          {document.category}
        </span>

        {document.files.length > 0 && (
          <span className="flex items-center gap-1 text-xs text-muted">
            <Files className="h-3 w-3" />
            {document.files.length}
          </span>
        )}

        {expiry && (
          <span className={cn('flex items-center gap-1 text-xs', expiry.className)}>
            {expiry.icon && <expiry.icon className="h-3 w-3" />}
            {expiry.label}
          </span>
        )}
      </div>

      {document.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {document.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
              {tag}
            </span>
          ))}
          {document.tags.length > 3 && (
            <span className="text-xs text-muted">+{document.tags.length - 3}</span>
          )}
        </div>
      )}
    </button>
  );
}
