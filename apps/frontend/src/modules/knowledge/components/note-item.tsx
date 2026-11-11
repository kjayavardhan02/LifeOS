import { Pin, Archive, FileText, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import type { KnowledgeNote } from '@lifeos/shared';

interface NoteItemProps {
  note: KnowledgeNote;
  onClick: (note: KnowledgeNote) => void;
}

export function NoteItem({ note, onClick }: NoteItemProps) {
  return (
    <div
      className="group flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-border-hover cursor-pointer"
      onClick={() => onClick(note)}
    >
      <div className="flex items-center gap-2">
        {!note.isQuickNote && (
          <span title="Vault note" className="shrink-0 text-primary">
            <FileText className="h-4 w-4" />
          </span>
        )}
        {note.isPinned && (
          <Pin className="h-3.5 w-3.5 shrink-0 fill-warning text-warning" />
        )}
        {note.isArchived && (
          <Archive className="h-3.5 w-3.5 shrink-0 text-muted" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">
            {note.title}
          </span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">
            {note.folder !== '/' ? note.folder : 'Root'}
          </span>
          {note.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded bg-card-hover px-1.5 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {note.tags.length > 4 && (
            <span className="text-xs text-muted">+{note.tags.length - 4}</span>
          )}
        </div>
      </div>

      <span className="shrink-0 text-xs text-muted">
        {format(new Date(note.updatedAt), 'MMM d, yyyy')}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
