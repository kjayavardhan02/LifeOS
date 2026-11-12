import { useState } from 'react';
import {
  Plus,
  LayoutGrid,
  List,
  RefreshCw,
  BookOpen,
  FileText,
  Pin,
  Bookmark as BookmarkIcon,
  FolderOpen,
  Tag,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useNotes,
  useBookmarks,
  useCreateNote,
  useUpdateNote,
  useCreateBookmark,
  useUpdateBookmark,
  useDeleteBookmark,
  useToggleBookmarkPin,
  useScanVault,
  useVaultStats,
  useFolders,
} from '../hooks/use-knowledge';
import { useSettings, useUpdateSettings } from '@/modules/settings/hooks/use-settings';
import { FolderPickerDialog } from '@/modules/settings/components/folder-picker-dialog';
import { KnowledgeFilters } from '../components/knowledge-filters';
import { BookmarkFilters } from '../components/bookmark-filters';
import { NoteCard } from '../components/note-card';
import { NoteItem } from '../components/note-item';
import { NoteDialog } from '../components/note-dialog';
import { NoteDetailPanel } from '../components/note-detail-panel';
import { BookmarkCard } from '../components/bookmark-card';
import { BookmarkDialog } from '../components/bookmark-dialog';
import { FolderTree } from '../components/folder-tree';
import type {
  KnowledgeNote,
  Bookmark,
  KnowledgeFilters as KnowledgeFiltersType,
  BookmarkFilters as BookmarkFiltersType,
  CreateQuickNoteInput,
  UpdateQuickNoteInput,
  CreateBookmarkInput,
  UpdateBookmarkInput,
} from '@lifeos/shared';

type ViewMode = 'grid' | 'list';
type Tab = 'notes' | 'bookmarks';

export function KnowledgePage() {
  const [tab, setTab] = useState<Tab>('notes');
  const [view, setView] = useState<ViewMode>('grid');
  const [noteFilters, setNoteFilters] = useState<KnowledgeFiltersType>({});
  const [bookmarkFilters, setBookmarkFilters] = useState<BookmarkFiltersType>({});
  const [notePage, setNotePage] = useState(1);
  const [bookmarkPage, setBookmarkPage] = useState(1);

  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<KnowledgeNote | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const [bookmarkDialogOpen, setBookmarkDialogOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [folderPickerOpen, setFolderPickerOpen] = useState(false);
  const [treeOpen, setTreeOpen] = useState(true);

  const { data: settingsData } = useSettings();
  const updateSettings = useUpdateSettings();
  const vaultPath = settingsData?.data?.obsidianVault || '';
  const { data: foldersData } = useFolders();
  const folders = foldersData?.data ?? [];

  const { data: notesData, isLoading: notesLoading } = useNotes({
    ...noteFilters,
    page: notePage,
    limit: 24,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });
  const { data: bookmarksData, isLoading: bookmarksLoading } = useBookmarks({
    ...bookmarkFilters,
    page: bookmarkPage,
    limit: 24,
  });
  const { data: statsData } = useVaultStats();

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const createBookmark = useCreateBookmark();
  const updateBookmark = useUpdateBookmark();
  const deleteBookmark = useDeleteBookmark();
  const toggleBookmarkPin = useToggleBookmarkPin();
  const scanVault = useScanVault();

  const notes = notesData?.data ?? [];
  const notesMeta = notesData?.meta;
  const bookmarks = bookmarksData?.data ?? [];
  const bookmarksMeta = bookmarksData?.meta;
  const stats = statsData?.data;

  const handleNoteSubmit = (input: CreateQuickNoteInput | (UpdateQuickNoteInput & { id: string })) => {
    if ('id' in input) {
      updateNote.mutate(input, {
        onSuccess: () => {
          setNoteDialogOpen(false);
          setEditingNote(null);
        },
      });
    } else {
      createNote.mutate(input, {
        onSuccess: () => setNoteDialogOpen(false),
      });
    }
  };

  const handleBookmarkSubmit = (input: CreateBookmarkInput | (UpdateBookmarkInput & { id: string })) => {
    if ('id' in input) {
      updateBookmark.mutate(input, {
        onSuccess: () => {
          setBookmarkDialogOpen(false);
          setEditingBookmark(null);
        },
      });
    } else {
      createBookmark.mutate(input, {
        onSuccess: () => setBookmarkDialogOpen(false),
      });
    }
  };

  const handleBookmarkAction = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setBookmarkDialogOpen(true);
  };

  const handleFolderSelect = (folder: string | undefined) => {
    setNoteFilters((prev) => ({ ...prev, folder }));
    setNotePage(1);
    if (tab !== 'notes') setTab('notes');
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Knowledge Base</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse your Obsidian vault and quick notes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => scanVault.mutate()}
            disabled={scanVault.isPending}
            className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('h-4 w-4', scanVault.isPending && 'animate-spin')} />
            Scan Vault
          </button>
          <button
            onClick={() => {
              setEditingNote(null);
              setNoteDialogOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B9BF0] to-[#3D6FBF] px-5 py-2 text-sm font-medium text-white shadow-[0_2px_12px_rgba(91,155,240,0.3)] hover:shadow-[0_4px_20px_rgba(91,155,240,0.4)] transition-all"
          >
            <Plus className="h-4 w-4" />
            New Note
          </button>
        </div>
      </div>

      {/* Vault Path */}
      <div className="mb-6 rounded-lg border border-border bg-card px-5 py-3">
        {vaultPath ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <FolderOpen className="h-4 w-4 shrink-0 text-success" />
              <div className="min-w-0">
                <span className="text-xs font-medium uppercase tracking-wider text-muted">Vault Path</span>
                <p className="truncate text-sm text-foreground font-mono">{vaultPath}</p>
              </div>
            </div>
            <button
              onClick={() => setFolderPickerOpen(true)}
              className="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FolderOpen className="h-4 w-4 shrink-0 text-warning" />
              <div>
                <p className="text-sm font-medium text-foreground">Obsidian vault not configured</p>
                <p className="text-xs text-muted-foreground">Select your vault folder to scan and browse notes</p>
              </div>
            </div>
            <button
              onClick={() => setFolderPickerOpen(true)}
              className="shrink-0 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B9BF0] to-[#3D6FBF] px-5 py-2 text-sm font-medium text-white shadow-[0_2px_12px_rgba(91,155,240,0.3)] hover:shadow-[0_4px_20px_rgba(91,155,240,0.4)] transition-all"
            >
              <FolderOpen className="h-4 w-4" />
              Select Vault Folder
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted">Total Notes</span>
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalNotes}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted">Vault Files</span>
              <FileText className="h-4 w-4 text-chart-2" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{stats.vaultNotes}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted">Quick Notes</span>
              <Pin className="h-4 w-4 text-warning" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{stats.quickNotes}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted">Folders</span>
              <FolderOpen className="h-4 w-4 text-success" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{stats.folders.length}</p>
          </div>
        </div>
      )}

      {/* Tag Cloud */}
      {stats && stats.tagCloud.length > 0 && (
        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="h-4 w-4 text-muted" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted">Popular Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.tagCloud.slice(0, 20).map(({ tag, count }) => (
              <button
                key={tag}
                onClick={() => {
                  setTab('notes');
                  setNoteFilters({ ...noteFilters, tags: [tag] });
                }}
                className="rounded-md bg-card-hover px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {tag} <span className="text-muted">({count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs + View toggle */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTreeOpen((o) => !o)}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-card-hover transition-colors"
            title={treeOpen ? 'Hide folder tree' : 'Show folder tree'}
          >
            {treeOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>
          <div className="flex rounded-md border border-border">
            <button
              onClick={() => setTab('notes')}
              className={cn(
                'flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium transition-colors first:rounded-l-md last:rounded-r-md',
                tab === 'notes'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              Notes
            </button>
            <button
              onClick={() => setTab('bookmarks')}
              className={cn(
                'flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium transition-colors first:rounded-l-md last:rounded-r-md',
                tab === 'bookmarks'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <BookmarkIcon className="h-3.5 w-3.5" />
              Bookmarks
            </button>
          </div>
        </div>

        {tab === 'notes' && (
          <div className="flex rounded-md border border-border">
            <button
              onClick={() => setView('grid')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors first:rounded-l-md last:rounded-r-md',
                view === 'grid'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors first:rounded-l-md last:rounded-r-md',
                view === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        )}
      </div>

      {/* Main content area with folder tree */}
      <div className="flex gap-6">
        {/* Folder tree sidebar */}
        {treeOpen && folders.length > 0 && (
          <div className="hidden md:block w-56 shrink-0">
            <div className="sticky top-20 rounded-lg border border-border bg-card p-3 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <FolderTree
                folders={folders}
                selectedFolder={noteFilters.folder}
                onSelect={handleFolderSelect}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Notes Tab */}
          {tab === 'notes' && (
            <>
              <div className="mb-4">
                <KnowledgeFilters filters={noteFilters} onChange={setNoteFilters} />
              </div>

              {noteFilters.folder && (
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Showing:</span>
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {noteFilters.folder === '/' ? 'Root' : noteFilters.folder}
                  </span>
                  <button
                    onClick={() => handleFolderSelect(undefined)}
                    className="rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="sr-only">Clear folder</span>
                    &times;
                  </button>
                </div>
              )}

              {notesLoading ? (
                <div className={cn(
                  view === 'grid'
                    ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
                    : 'space-y-2',
                )}>
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'animate-pulse rounded-lg border border-border bg-card',
                        view === 'grid' ? 'h-40' : 'h-16',
                      )}
                    />
                  ))}
                </div>
              ) : notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
                  <BookOpen className="h-10 w-10 text-muted mb-3" />
                  <p className="text-sm text-muted-foreground">No notes found</p>
                  <p className="mt-1 text-xs text-muted">
                    {noteFilters.folder
                      ? 'No notes in this folder'
                      : 'Create a quick note or scan your Obsidian vault'}
                  </p>
                  {!noteFilters.folder && (
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => scanVault.mutate()}
                        disabled={scanVault.isPending}
                        className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Scan Vault
                      </button>
                      <button
                        onClick={() => {
                          setEditingNote(null);
                          setNoteDialogOpen(true);
                        }}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B9BF0] to-[#3D6FBF] px-5 py-2 text-sm font-medium text-white shadow-[0_2px_12px_rgba(91,155,240,0.3)] hover:shadow-[0_4px_20px_rgba(91,155,240,0.4)] transition-all"
                      >
                        <Plus className="h-4 w-4" />
                        Create Note
                      </button>
                    </div>
                  )}
                </div>
              ) : view === 'grid' ? (
                <div className={cn(
                  'grid grid-cols-1 gap-4 sm:grid-cols-2',
                  !treeOpen && 'lg:grid-cols-3',
                )}>
                  {notes.map((note, i) => (
                    <div key={note.id} className="animate-card-in" style={{ '--i': i } as React.CSSProperties}>
                      <NoteCard note={note} onClick={(n) => setSelectedNoteId(n.id)} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {notes.map((note, i) => (
                    <div key={note.id} className="animate-card-in" style={{ '--i': i } as React.CSSProperties}>
                      <NoteItem note={note} onClick={(n) => setSelectedNoteId(n.id)} />
                    </div>
                  ))}
                </div>
              )}

              {notesMeta && notesMeta.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setNotePage((p) => Math.max(1, p - 1))}
                    disabled={notePage === 1}
                    className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {notePage} of {notesMeta.totalPages}
                  </span>
                  <button
                    onClick={() => setNotePage((p) => Math.min(notesMeta.totalPages, p + 1))}
                    disabled={notePage === notesMeta.totalPages}
                    className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* Bookmarks Tab */}
          {tab === 'bookmarks' && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <BookmarkFilters filters={bookmarkFilters} onChange={setBookmarkFilters} />
                <button
                  onClick={() => {
                    setEditingBookmark(null);
                    setBookmarkDialogOpen(true);
                  }}
                  className="ml-3 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B9BF0] to-[#3D6FBF] px-5 py-2 text-sm font-medium text-white shadow-[0_2px_12px_rgba(91,155,240,0.3)] hover:shadow-[0_4px_20px_rgba(91,155,240,0.4)] transition-all shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  Add Bookmark
                </button>
              </div>

              {bookmarksLoading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-36 animate-pulse rounded-lg border border-border bg-card" />
                  ))}
                </div>
              ) : bookmarks.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
                  <BookmarkIcon className="h-10 w-10 text-muted mb-3" />
                  <p className="text-sm text-muted-foreground">No bookmarks yet</p>
                  <p className="mt-1 text-xs text-muted">
                    Save useful links with tags for easy access
                  </p>
                  <button
                    onClick={() => {
                      setEditingBookmark(null);
                      setBookmarkDialogOpen(true);
                    }}
                    className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B9BF0] to-[#3D6FBF] px-5 py-2 text-sm font-medium text-white shadow-[0_2px_12px_rgba(91,155,240,0.3)] hover:shadow-[0_4px_20px_rgba(91,155,240,0.4)] transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    Add Bookmark
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {bookmarks.map((bookmark, i) => (
                    <div key={bookmark.id} className="animate-card-in" style={{ '--i': i } as React.CSSProperties}>
                      <BookmarkCard bookmark={bookmark} onClick={handleBookmarkAction} />
                    </div>
                  ))}
                </div>
              )}

              {bookmarksMeta && bookmarksMeta.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setBookmarkPage((p) => Math.max(1, p - 1))}
                    disabled={bookmarkPage === 1}
                    className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {bookmarkPage} of {bookmarksMeta.totalPages}
                  </span>
                  <button
                    onClick={() => setBookmarkPage((p) => Math.min(bookmarksMeta.totalPages, p + 1))}
                    disabled={bookmarkPage === bookmarksMeta.totalPages}
                    className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <NoteDialog
        open={noteDialogOpen}
        onClose={() => {
          setNoteDialogOpen(false);
          setEditingNote(null);
        }}
        onSubmit={handleNoteSubmit}
        note={editingNote}
      />

      <BookmarkDialog
        open={bookmarkDialogOpen}
        onClose={() => {
          setBookmarkDialogOpen(false);
          setEditingBookmark(null);
        }}
        onSubmit={handleBookmarkSubmit}
        bookmark={editingBookmark}
      />

      <NoteDetailPanel
        noteId={selectedNoteId}
        onClose={() => setSelectedNoteId(null)}
      />

      <FolderPickerDialog
        open={folderPickerOpen}
        onClose={() => setFolderPickerOpen(false)}
        onSelect={(path) => {
          updateSettings.mutate({
            obsidianVault: path,
          });
        }}
        initialPath={vaultPath || undefined}
      />
    </div>
  );
}
