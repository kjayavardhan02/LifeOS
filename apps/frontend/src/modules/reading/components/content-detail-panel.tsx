import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import {
  X,
  FileText,
  BookOpen,
  Play,
  Headphones,
  Star,
  Heart,
  ExternalLink,
  Trash2,
  Plus,
  Highlighter,
  Tag,
  FolderOpen,
  Globe,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useUpdateContentItem,
  useDeleteContentItem,
  useToggleFavorite,
  useAddHighlight,
  useDeleteHighlight,
} from '../hooks/use-reading';
import type { ContentItem, ContentType, ContentStatus } from '@lifeos/shared';

interface ContentDetailPanelProps {
  item: ContentItem | null;
  onClose: () => void;
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

const statusFlow: ContentStatus[] = ['queued', 'in_progress', 'completed', 'dropped'];

export function ContentDetailPanel({ item, onClose }: ContentDetailPanelProps) {
  const updateItem = useUpdateContentItem();
  const deleteItem = useDeleteContentItem();
  const toggleFavorite = useToggleFavorite();
  const addHighlight = useAddHighlight();
  const deleteHighlight = useDeleteHighlight();

  const [highlightText, setHighlightText] = useState('');
  const [highlightNote, setHighlightNote] = useState('');
  const [showHighlightForm, setShowHighlightForm] = useState(false);

  useEffect(() => {
    setHighlightText('');
    setHighlightNote('');
    setShowHighlightForm(false);
  }, [item?.id]);

  if (!item) return null;

  const TypeIcon = typeIcons[item.type];
  const typeColor = typeColors[item.type];
  const status = statusConfig[item.status];

  const handleStatusChange = (newStatus: ContentStatus) => {
    updateItem.mutate({ id: item.id, status: newStatus });
  };

  const handleDelete = () => {
    deleteItem.mutate(item.id);
    onClose();
  };

  const handleAddHighlight = () => {
    if (!highlightText.trim()) return;
    addHighlight.mutate({
      contentItemId: item.id,
      text: highlightText.trim(),
      note: highlightNote.trim() || undefined,
    }, {
      onSuccess: () => {
        setHighlightText('');
        setHighlightNote('');
        setShowHighlightForm(false);
      },
    });
  };

  const bookProgress =
    item.type === 'book' && item.currentPage && item.totalPages
      ? Math.min(Math.round((item.currentPage / item.totalPages) * 100), 100)
      : null;

  const inputClass =
    'w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary';

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 animate-overlay-in" onClick={onClose} />
      <div className="absolute inset-0 overflow-hidden flex items-center justify-center p-6 pointer-events-none">
        <div className="relative w-full max-w-2xl rounded-lg border border-border bg-card shadow-2xl flex flex-col animate-dialog-in pointer-events-auto" style={{ maxHeight: 'calc(100vh - 3rem)' }}>
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between border-b border-border bg-card px-5 py-4 rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', typeColor.bg)}>
                <TypeIcon className={cn('h-4 w-4', typeColor.text)} />
              </div>
              <span className={cn('text-xs font-medium capitalize', typeColor.text)}>{item.type}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleFavorite.mutate({ id: item.id, isFavorite: !item.isFavorite })}
                className="rounded-md p-1.5 transition-colors hover:bg-card-hover"
                title={item.isFavorite ? 'Unfavorite' : 'Favorite'}
              >
                <Heart
                  className={cn(
                    'h-4 w-4',
                    item.isFavorite ? 'text-[#E05A52] fill-[#E05A52]' : 'text-muted-foreground hover:text-[#E05A52]',
                  )}
                />
              </button>
              <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5 overflow-y-auto flex-1 min-h-0 overscroll-contain">
            {/* Title */}
            <div>
              <h2 className="text-lg font-semibold text-foreground">{item.title}</h2>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open link
                </a>
              )}
            </div>

            {/* Status buttons */}
            <div>
              <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Status</h3>
              <div className="flex flex-wrap gap-2">
                {statusFlow.map((s) => {
                  const cfg = statusConfig[s];
                  return (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium transition-all border',
                        item.status === s
                          ? `${cfg.bg} ${cfg.color} border-current`
                          : 'border-border text-muted-foreground hover:text-foreground hover:border-border-hover',
                      )}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rating */}
            <div>
              <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Rating</h3>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    onClick={() => updateItem.mutate({ id: item.id, rating: item.rating === i ? null : i })}
                    className="rounded p-0.5 transition-colors hover:bg-card-hover"
                  >
                    <Star
                      className={cn(
                        'h-5 w-5 transition-colors',
                        item.rating && i <= item.rating ? 'text-[#F5C344] fill-[#F5C344]' : 'text-muted/30 hover:text-[#F5C344]/50',
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Book progress */}
            {item.type === 'book' && (
              <div>
                <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Reading Progress</h3>
                {bookProgress !== null ? (
                  <>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-1.5">
                      <span>Page {item.currentPage} of {item.totalPages}</span>
                      <span className="font-medium">{bookProgress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#5B9BF0] transition-all"
                        style={{ width: `${bookProgress}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No progress tracked yet</p>
                )}
              </div>
            )}

            {/* Meta info */}
            <div className="space-y-3">
              {item.category && (
                <div className="flex items-start gap-3">
                  <Tag className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm text-foreground">{item.category}</span>
                </div>
              )}
              {item.source && (
                <div className="flex items-start gap-3">
                  <Globe className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm text-foreground">{item.source}</span>
                </div>
              )}
              {item.collection && (
                <div className="flex items-start gap-3">
                  <FolderOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm"
                    style={{ backgroundColor: `${item.collection.color}15`, color: item.collection.color }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.collection.color }} />
                    {item.collection.name}
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            {item.tags.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span key={tag} className="rounded bg-card-hover px-2 py-0.5 text-xs text-muted-foreground">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {item.notes && (
              <div>
                <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Notes</h3>
                <div className="rounded-md border border-border bg-background p-3">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{item.notes}</p>
                </div>
              </div>
            )}

            {/* Highlights */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Highlighter className="h-3.5 w-3.5" />
                  Highlights ({item.highlights?.length ?? 0})
                </h3>
                <button
                  onClick={() => setShowHighlightForm(!showHighlightForm)}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>

              {showHighlightForm && (
                <div className="mb-3 rounded-md border border-border bg-background p-3 space-y-2">
                  <textarea
                    value={highlightText}
                    onChange={(e) => setHighlightText(e.target.value)}
                    placeholder="Highlight text..."
                    rows={2}
                    className={inputClass + ' resize-none'}
                    autoFocus
                  />
                  <input
                    type="text"
                    value={highlightNote}
                    onChange={(e) => setHighlightNote(e.target.value)}
                    placeholder="Optional note..."
                    className={inputClass}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddHighlight}
                      disabled={!highlightText.trim()}
                      className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setShowHighlightForm(false); setHighlightText(''); setHighlightNote(''); }}
                      className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {item.highlights && item.highlights.length > 0 ? (
                <div className="space-y-2">
                  {item.highlights.map((hl) => (
                    <div key={hl.id} className="group rounded-md border-l-2 border-[#F5C344] bg-background p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-foreground italic">"{hl.text}"</p>
                        <button
                          onClick={() => deleteHighlight.mutate({ contentItemId: item.id, highlightId: hl.id })}
                          className="shrink-0 rounded-md p-1 text-muted opacity-0 group-hover:opacity-100 hover:text-danger transition-all"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      {hl.note && (
                        <p className="mt-1.5 text-xs text-muted-foreground">{hl.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                !showHighlightForm && (
                  <p className="text-sm text-muted-foreground">No highlights yet</p>
                )
              )}
            </div>

            {/* Metadata */}
            <div className="flex items-start gap-3 text-xs text-muted">
              <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <div className="space-y-0.5">
                <p>Added {format(new Date(item.createdAt), 'MMM d, yyyy')}</p>
                {item.completedAt && (
                  <p className="text-[#2BD47D]">
                    Completed {format(new Date(item.completedAt), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>

            {/* Delete */}
            <div className="pt-4 border-t border-border">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete Content
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
