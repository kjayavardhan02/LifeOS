import { FileText, BookOpen, Play, Headphones, Heart, Star, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ContentItem, ContentType, ContentStatus } from '@lifeos/shared';

interface ContentItemCardProps {
  item: ContentItem;
  onEdit: (item: ContentItem) => void;
  onDelete: (id: string) => void;
  onClick: (item: ContentItem) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
}

const typeIcons: Record<ContentType, typeof FileText> = {
  article: FileText,
  book: BookOpen,
  video: Play,
  podcast: Headphones,
};

const typeColors: Record<ContentType, { bg: string; text: string }> = {
  article: { bg: 'bg-[#5B9BF0]/10', text: 'text-[#5B9BF0]' },
  book: { bg: 'bg-[#E89B6E]/10', text: 'text-[#E89B6E]' },
  video: { bg: 'bg-[#E05A52]/10', text: 'text-[#E05A52]' },
  podcast: { bg: 'bg-[#2BD47D]/10', text: 'text-[#2BD47D]' },
};

const statusConfig: Record<ContentStatus, { label: string; color: string; bg: string }> = {
  queued: { label: 'Queued', color: 'text-[#A6A39F]', bg: 'bg-[#A6A39F]/10' },
  in_progress: { label: 'In Progress', color: 'text-[#5B9BF0]', bg: 'bg-[#5B9BF0]/10' },
  completed: { label: 'Completed', color: 'text-[#2BD47D]', bg: 'bg-[#2BD47D]/10' },
  dropped: { label: 'Dropped', color: 'text-[#E05A52]', bg: 'bg-[#E05A52]/10' },
};

function RatingStars({ rating }: { rating: number | null | undefined }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            'h-3 w-3',
            i <= rating ? 'text-[#F5C344] fill-[#F5C344]' : 'text-muted/30',
          )}
        />
      ))}
    </div>
  );
}

export function ContentItemCard({ item, onEdit, onDelete, onClick, onToggleFavorite }: ContentItemCardProps) {
  const TypeIcon = typeIcons[item.type];
  const typeColor = typeColors[item.type];
  const status = statusConfig[item.status];

  const bookProgress =
    item.type === 'book' && item.currentPage && item.totalPages
      ? Math.min(Math.round((item.currentPage / item.totalPages) * 100), 100)
      : null;

  return (
    <div
      className="group relative rounded-xl border border-border bg-card p-4 transition-all hover:bg-card-hover/50 hover:border-border-hover cursor-pointer card-interactive"
      onClick={() => onClick(item)}
    >
      <div className="flex items-start gap-3">
        {/* Type icon */}
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', typeColor.bg)}>
          <TypeIcon className={cn('h-4 w-4', typeColor.text)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-foreground truncate">{item.title}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', status.bg, status.color)}>
                  {status.label}
                </span>
                <span className="text-xs text-muted capitalize">{item.type}</span>
                {item.source && (
                  <>
                    <span className="text-muted text-xs">from</span>
                    <span className="text-xs text-muted-foreground">{item.source}</span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.id, !item.isFavorite); }}
                className="rounded-md p-1.5 transition-colors hover:bg-card-hover"
                title={item.isFavorite ? 'Unfavorite' : 'Favorite'}
              >
                <Heart
                  className={cn(
                    'h-3.5 w-3.5 transition-colors',
                    item.isFavorite ? 'text-[#E05A52] fill-[#E05A52]' : 'text-muted hover:text-[#E05A52]',
                  )}
                />
              </button>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    title="Open URL"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                  className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  title="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                  className="rounded-md p-1.5 text-muted-foreground hover:text-danger transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom row: rating, collection, progress */}
          <div className="mt-2 flex items-center gap-3">
            <RatingStars rating={item.rating} />

            {item.collection && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-muted-foreground"
                style={{ backgroundColor: `${item.collection.color}15`, color: item.collection.color }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: item.collection.color }}
                />
                {item.collection.name}
              </span>
            )}

            {item.tags.length > 0 && (
              <div className="hidden sm:flex items-center gap-1">
                {item.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded bg-card-hover px-1.5 py-0.5 text-xs text-muted-foreground">
                    {tag}
                  </span>
                ))}
                {item.tags.length > 3 && (
                  <span className="text-xs text-muted">+{item.tags.length - 3}</span>
                )}
              </div>
            )}
          </div>

          {/* Book progress bar */}
          {bookProgress !== null && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Page {item.currentPage} of {item.totalPages}</span>
                <span>{bookProgress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#5B9BF0] transition-all"
                  style={{ width: `${bookProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
