import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  ContentItem,
  ContentType,
  ContentStatus,
  ContentCollection,
  CreateContentItemInput,
  UpdateContentItemInput,
} from '@lifeos/shared';

interface ContentItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateContentItemInput | (UpdateContentItemInput & { id: string })) => void;
  item?: ContentItem | null;
  collections: ContentCollection[];
}

const typeOptions: { value: ContentType; label: string }[] = [
  { value: 'article', label: 'Article' },
  { value: 'book', label: 'Book' },
  { value: 'video', label: 'Video' },
  { value: 'podcast', label: 'Podcast' },
];

const statusOptions: { value: ContentStatus; label: string }[] = [
  { value: 'queued', label: 'Queued' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'dropped', label: 'Dropped' },
];

export function ContentItemDialog({ open, onClose, onSubmit, item, collections }: ContentItemDialogProps) {
  const isEdit = !!item;

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<ContentType>('article');
  const [status, setStatus] = useState<ContentStatus>('queued');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [collectionId, setCollectionId] = useState('');

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setUrl(item.url ?? '');
      setType(item.type);
      setStatus(item.status);
      setCategory(item.category);
      setTags(item.tags.join(', '));
      setSource(item.source ?? '');
      setNotes(item.notes ?? '');
      setRating(item.rating ?? 0);
      setCurrentPage(item.currentPage?.toString() ?? '');
      setTotalPages(item.totalPages?.toString() ?? '');
      setCollectionId(item.collectionId ?? '');
    } else {
      setTitle('');
      setUrl('');
      setType('article');
      setStatus('queued');
      setCategory('General');
      setTags('');
      setSource('');
      setNotes('');
      setRating(0);
      setCurrentPage('');
      setTotalPages('');
      setCollectionId('');
    }
  }, [item, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
    const parsedCurrentPage = currentPage ? parseInt(currentPage, 10) : null;
    const parsedTotalPages = totalPages ? parseInt(totalPages, 10) : null;

    if (isEdit) {
      onSubmit({
        id: item.id,
        title: title.trim(),
        url: url.trim() || null,
        type,
        status,
        category: category.trim(),
        tags: tagList,
        source: source.trim() || null,
        notes: notes.trim() || null,
        rating: rating > 0 ? rating : null,
        currentPage: parsedCurrentPage,
        totalPages: parsedTotalPages,
        collectionId: collectionId || null,
      });
    } else {
      onSubmit({
        title: title.trim(),
        url: url.trim() || undefined,
        type,
        status,
        category: category.trim() || undefined,
        tags: tagList.length ? tagList : undefined,
        source: source.trim() || undefined,
        notes: notes.trim() || undefined,
        rating: rating > 0 ? rating : undefined,
        currentPage: parsedCurrentPage,
        totalPages: parsedTotalPages,
        collectionId: collectionId || undefined,
      });
    }
  };

  const inputClass =
    'w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary';
  const labelClass = 'block text-sm font-medium text-muted-foreground mb-1.5';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh]">
      <div className="fixed inset-0 bg-black/60 animate-overlay-in" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-lg border border-border bg-card shadow-2xl max-h-[90vh] overflow-y-auto animate-dialog-in">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4 rounded-t-lg">
          <h2 className="text-base font-semibold text-foreground">
            {isEdit ? 'Edit Content' : 'Add Content'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className={labelClass}>Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Content title"
              className={inputClass}
              autoFocus
            />
          </div>

          <div>
            <label className={labelClass}>URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ContentType)}
                className={inputClass}
              >
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ContentStatus)}
                className={inputClass}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="General"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Source</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Twitter, Reddit, Friend..."
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Collection</label>
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className={inputClass}
            >
              <option value="">No collection</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-muted">Separate tags with commas</p>
          </div>

          {/* Book-specific fields */}
          {type === 'book' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Current Page</label>
                <input
                  type="number"
                  min="0"
                  value={currentPage}
                  onChange={(e) => setCurrentPage(e.target.value)}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Total Pages</label>
                <input
                  type="number"
                  min="1"
                  value={totalPages}
                  onChange={(e) => setTotalPages(e.target.value)}
                  placeholder="300"
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {/* Rating */}
          <div>
            <label className={labelClass}>Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(rating === i ? 0 : i)}
                  className="rounded p-0.5 transition-colors hover:bg-card-hover"
                >
                  <Star
                    className={cn(
                      'h-5 w-5 transition-colors',
                      i <= rating ? 'text-[#F5C344] fill-[#F5C344]' : 'text-muted/30 hover:text-[#F5C344]/50',
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <button
                  type="button"
                  onClick={() => setRating(0)}
                  className="ml-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Your thoughts..."
              rows={3}
              className={inputClass + ' resize-none'}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              {isEdit ? 'Save Changes' : 'Add Content'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
