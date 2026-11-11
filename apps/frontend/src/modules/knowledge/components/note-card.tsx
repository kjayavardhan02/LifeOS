import { Pin, Archive, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { KnowledgeNote } from '@lifeos/shared';

interface NoteCardProps {
  note: KnowledgeNote;
  onClick: (note: KnowledgeNote) => void;
}

export function NoteCard({ note, onClick }: NoteCardProps) {
  const preview = note.content
    ? note.content.replace(/<[^>]*>/g, '').replace(/^#.*$/gm, '').replace(/[*_~`>\[\]]/g, '').trim().slice(0, 120)
    : '';

  return (
    <div
      className="group cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors hover:border-border-hover"
      onClick={() => onClick(note)}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {!note.isQuickNote && (
            <span title="Vault note" className="shrink-0 text-primary">
              <FileText className="h-4 w-4" />
            </span>
          )}
          <h3 className="truncate text-sm font-medium text-foreground">
            {note.title}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {note.isPinned && (
            <Pin className="h-3.5 w-3.5 fill-warning text-warning" />
          )}
          {note.isArchived && (
            <Archive className="h-3.5 w-3.5 text-muted" />
          )}
        </div>
      </div>

      {preview && (
        <p className="mb-3 text-xs text-muted-foreground line-clamp-3">
          {preview}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {note.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded bg-card-hover px-1.5 py-0.5 text-xs text-muted-foreground"
          >
            {tag}
          </span>
        ))}
        {note.tags.length > 3 && (
          <span className="text-xs text-muted">+{note.tags.length - 3}</span>
        )}
      </div>

      <div className={cn('mt-3 flex items-center justify-between text-xs text-muted')}>
        <span>{note.folder !== '/' ? note.folder : 'Root'}</span>
        <span>{format(new Date(note.updatedAt), 'MMM d, yyyy')}</span>
      </div>
    </div>
  );
}
