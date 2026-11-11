import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Pin, Archive, Trash2, Edit2, ExternalLink, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useNote, useToggleNotePin, useToggleNoteArchive, useDeleteNote, useUpdateNote } from '../hooks/use-knowledge';
import type { KnowledgeNote, UpdateQuickNoteInput } from '@lifeos/shared';

interface NoteDetailPanelProps {
  noteId: string | null;
  onClose: () => void;
}

export function NoteDetailPanel({ noteId, onClose }: NoteDetailPanelProps) {
  const { data: noteData } = useNote(noteId ?? undefined);
  const togglePin = useToggleNotePin();
  const toggleArchive = useToggleNoteArchive();
  const deleteNote = useDeleteNote();
  const updateNote = useUpdateNote();

  const note = noteData?.data ?? null;

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');

  useEffect(() => {
    if (note) {
      setEditTitle(note.title);
      setEditContent(note.content ?? '');
      setEditTags(note.tags.join(', '));
      setIsEditing(false);
    }
  }, [note]);

  if (!noteId) return null;

  const handleDelete = () => {
    deleteNote.mutate(noteId);
    onClose();
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return;
    const tagList = editTags.split(',').map((t) => t.trim()).filter(Boolean);
    const input: UpdateQuickNoteInput & { id: string } = {
      id: noteId,
      title: editTitle.trim(),
      content: editContent || null,
      tags: tagList,
    };
    updateNote.mutate(input, {
      onSuccess: () => setIsEditing(false),
    });
  };

  const handleOpenInObsidian = () => {
    if (!note?.filePath) return;
    // obsidian://open?vault=VaultName&file=path
    // We use just the file parameter; the vault name would need to be configured
    const vaultName = 'ObsidianVault';
    const fileParam = encodeURIComponent(note.filePath.replace(/\.md$/, ''));
    window.open(`obsidian://open?vault=${vaultName}&file=${fileParam}`, '_blank');
  };

  const inputClass =
    'w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary';

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 animate-overlay-in" onClick={onClose} />
      <div className="absolute inset-0 overflow-hidden flex items-center justify-center p-6 pointer-events-none">
        <div className="relative w-full max-w-2xl rounded-lg border border-border bg-card shadow-2xl flex flex-col animate-dialog-in pointer-events-auto" style={{ maxHeight: 'calc(100vh - 3rem)' }}>
        <div className="shrink-0 flex items-center justify-between border-b border-border bg-card px-5 py-4 rounded-t-lg">
          <h2 className="text-base font-semibold text-foreground truncate">
            {note?.title ?? 'Loading...'}
          </h2>
          <div className="flex items-center gap-1">
            {note?.isQuickNote && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                title="Edit note"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {note && (
          <div className="p-5 space-y-5 overflow-y-auto flex-1 min-h-0 overscroll-contain">
            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => togglePin.mutate(noteId)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                  note.isPinned
                    ? 'border-warning bg-warning/10 text-warning'
                    : 'border-border text-muted-foreground hover:text-foreground',
                )}
              >
                <Pin className={cn('h-3.5 w-3.5', note.isPinned && 'fill-warning')} />
                {note.isPinned ? 'Pinned' : 'Pin'}
              </button>
              <button
                onClick={() => toggleArchive.mutate(noteId)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                  note.isArchived
                    ? 'border-muted bg-muted/10 text-muted-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground',
                )}
              >
                <Archive className="h-3.5 w-3.5" />
                {note.isArchived ? 'Archived' : 'Archive'}
              </button>
              {!note.isQuickNote && note.filePath && (
                <button
                  onClick={handleOpenInObsidian}
                  className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open in Obsidian
                </button>
              )}
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-3 text-xs text-muted">
              <span className="flex items-center gap-1">
                <FolderOpen className="h-3.5 w-3.5" />
                {note.folder !== '/' ? note.folder : 'Root'}
              </span>
              <span>{note.isQuickNote ? 'Quick Note' : 'Vault File'}</span>
              <span>Updated {format(new Date(note.updatedAt), 'MMM d, yyyy')}</span>
            </div>

            {/* Tags */}
            {!isEditing && note.tags.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {note.tags.map((tag) => (
                    <span key={tag} className="rounded bg-card-hover px-2 py-0.5 text-xs text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Content</label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={16}
                    className={inputClass + ' resize-none font-mono text-xs'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Tags</label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className={inputClass}
                    placeholder="tag1, tag2"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    disabled={!editTitle.trim()}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Content</h3>
                {note.content ? (
                  <div className="md-content">
                    <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {note.content}
                    </Markdown>
                  </div>
                ) : (
                  <p className="text-sm text-muted italic">No content</p>
                )}
              </div>
            )}

            {/* Aliases */}
            {note.aliases && note.aliases.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Aliases</h3>
                <div className="flex flex-wrap gap-1.5">
                  {note.aliases.map((alias) => (
                    <span key={alias} className="rounded bg-card-hover px-2 py-0.5 text-xs text-muted-foreground">
                      {alias}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Delete */}
            <div className="pt-4 border-t border-border">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete Note
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
