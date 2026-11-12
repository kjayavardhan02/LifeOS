import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { ContentCollection, CreateCollectionInput, UpdateCollectionInput } from '@lifeos/shared';

interface CollectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCollectionInput | (UpdateCollectionInput & { id: string })) => void;
  collection?: ContentCollection | null;
}

const presetColors = [
  '#4E85DE', '#5B9BF0', '#3D6FBF',
  '#2BD47D', '#22A06B',
  '#F5C344', '#E89B6E',
  '#E05A52', '#C04741',
  '#A6A39F', '#777572',
];

export function CollectionDialog({ open, onClose, onSubmit, collection }: CollectionDialogProps) {
  const isEdit = !!collection;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#4E85DE');

  useEffect(() => {
    if (collection) {
      setName(collection.name);
      setDescription(collection.description ?? '');
      setColor(collection.color);
    } else {
      setName('');
      setDescription('');
      setColor('#4E85DE');
    }
  }, [collection, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEdit) {
      onSubmit({
        id: collection.id,
        name: name.trim(),
        description: description.trim() || null,
        color,
      });
    } else {
      onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        color,
      });
    }
  };

  const inputClass =
    'w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary';
  const labelClass = 'block text-sm font-medium text-muted-foreground mb-1.5';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      <div className="fixed inset-0 bg-black/60 animate-overlay-in" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-card shadow-2xl max-h-[80vh] overflow-y-auto animate-dialog-in">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4 rounded-t-lg">
          <h2 className="text-base font-semibold text-foreground">
            {isEdit ? 'Edit Collection' : 'New Collection'}
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
            <label className={labelClass}>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Collection name"
              className={inputClass}
              autoFocus
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              rows={3}
              className={inputClass + ' resize-none'}
            />
          </div>

          <div>
            <label className={labelClass}>Color</label>
            <div className="flex flex-wrap gap-2">
              {presetColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-7 w-7 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? '#E5E5E3' : 'transparent',
                    boxShadow: color === c ? `0 0 0 2px ${c}40` : undefined,
                  }}
                />
              ))}
            </div>
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
              disabled={!name.trim()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              {isEdit ? 'Save Changes' : 'Create Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
