import { Pin, ExternalLink, Globe } from 'lucide-react';
import { format } from 'date-fns';
import type { Bookmark } from '@lifeos/shared';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onClick: (bookmark: Bookmark) => void;
}

export function BookmarkCard({ bookmark, onClick }: BookmarkCardProps) {
  const domain = (() => {
    try {
      return new URL(bookmark.url).hostname.replace('www.', '');
    } catch {
      return bookmark.url;
    }
  })();

  return (
    <div
      className="group cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors hover:border-border-hover"
      onClick={() => onClick(bookmark)}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {bookmark.favicon ? (
            <img
              src={bookmark.favicon}
              alt=""
              className="h-4 w-4 shrink-0 rounded"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <Globe className="h-4 w-4 shrink-0 text-muted" />
          )}
          <h3 className="truncate text-sm font-medium text-foreground">
            {bookmark.title}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {bookmark.isPinned && (
            <Pin className="h-3.5 w-3.5 fill-warning text-warning" />
          )}
        </div>
      </div>

      {bookmark.description && (
        <p className="mb-3 text-xs text-muted-foreground line-clamp-2">
          {bookmark.description}
        </p>
      )}

      <div className="flex items-center gap-1.5 text-xs text-primary mb-2">
        <ExternalLink className="h-3 w-3" />
        <span className="truncate">{domain}</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {bookmark.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded bg-card-hover px-1.5 py-0.5 text-xs text-muted-foreground"
          >
            {tag}
          </span>
        ))}
        {bookmark.tags.length > 3 && (
          <span className="text-xs text-muted">+{bookmark.tags.length - 3}</span>
        )}
        <span className="ml-auto text-xs text-muted">
          {format(new Date(bookmark.createdAt), 'MMM d')}
        </span>
      </div>
    </div>
  );
}
