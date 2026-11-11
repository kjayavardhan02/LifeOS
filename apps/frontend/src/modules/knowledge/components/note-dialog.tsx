import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { KnowledgeNote, CreateQuickNoteInput, UpdateQuickNoteInput } from '@lifeos/shared';

interface NoteDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateQuickNoteInput | (UpdateQuickNoteInput & { id: string })) => void;
  note?: KnowledgeNote | null;
}

export function NoteDialog({ open, onClose, onSubmit, note }: NoteDialogProps) {
  const isEdit = !!note;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content ?? '');
      setTags(note.tags.join(', '));
    } else {
      setTitle('');
      setContent('');
      setTags('');
    }
  }, [note, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (isEdit) {
      onSubmit({
        id: note.id,
        title: title.trim(),
        content: content || null,
        tags: tagList,
      });
    } else {
      onSubmit({
        title: title.trim(),
        content: content || undefined,
        tags: tagList.length ? tagList : undefined,
      });
    }
  };

  const inputClass =
    'w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary';
  const labelClass = 'block text-sm font-medium text-muted-foreground mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      <div className="fixed inset-0 bg-black/60 animate-overlay-in" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-lg border border-border bg-card shadow-2xl max-h-[80vh] overflow-y-auto animate-dialog-in">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">
            {isEdit ? 'Edit Note' : 'New Quick Note'}
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
              placeholder="Note title"
              className={inputClass}
              autoFocus
            />
          </div>

          <div>
            <label className={labelClass}>Content (Markdown)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note in Markdown..."
              rows={12}
              className={inputClass + ' resize-none font-mono text-xs'}
            />
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
              {isEdit ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
