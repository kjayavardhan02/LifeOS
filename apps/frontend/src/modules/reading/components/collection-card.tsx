import { Pencil, Trash2, FolderOpen } from 'lucide-react';
import type { ContentCollection } from '@lifeos/shared';

interface CollectionCardProps {
  collection: ContentCollection;
  onEdit: (collection: ContentCollection) => void;
  onDelete: (id: string) => void;
  onClick: (collection: ContentCollection) => void;
}

export function CollectionCard({ collection, onEdit, onDelete, onClick }: CollectionCardProps) {
  const itemCount = collection._count?.items ?? 0;

  return (
    <div
      className="group relative rounded-xl border border-border bg-card p-5 transition-all hover:bg-card-hover/50 hover:border-border-hover cursor-pointer card-interactive overflow-hidden"
      onClick={() => onClick(collection)}
    >
      {/* Color accent strip at the top */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{ backgroundColor: collection.color }}
      />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 shrink-0" style={{ color: collection.color }} />
            <h3 className="text-sm font-medium text-foreground truncate">{collection.name}</h3>
          </div>
          {collection.description && (
            <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{collection.description}</p>
          )}
          <p className="mt-2 text-xs text-muted">
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(collection); }}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(collection.id); }}
            className="rounded-md p-1.5 text-muted-foreground hover:text-danger transition-colors"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
