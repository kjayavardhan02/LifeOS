import { useState } from 'react';
import {
  Plus,
  List,
  LayoutGrid,
  FileBox,
  AlertTriangle,
  Clock,
  HardDrive,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatCard } from '@/components/shared/stat-card';
import {
  useDocuments,
  useDocumentStats,
  useCreateDocument,
  useUpdateDocument,
  useDocumentFolders,
} from '../hooks/use-documents';
import { DocumentFilters } from '../components/document-filters';
import { DocumentCard } from '../components/document-card';
import { DocumentItem } from '../components/document-item';
import { DocumentDialog } from '../components/document-dialog';
import { DocumentDetailPanel } from '../components/document-detail-panel';
import { DocumentFolderTree } from '../components/document-folder-tree';
import type {
  Document,
  DocumentFilters as DocumentFiltersType,
  CreateDocumentInput,
  UpdateDocumentInput,
} from '@lifeos/shared';

type ViewMode = 'grid' | 'list';

function formatStorageSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(1)} GB`;
}

export function DocumentsPage() {
  const [view, setView] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<DocumentFiltersType>({});
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [treeOpen, setTreeOpen] = useState(true);
  const [localFolders, setLocalFolders] = useState<string[]>([]);

  const { data, isLoading } = useDocuments({ ...filters, page, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' });
  const { data: statsData } = useDocumentStats();
  const { data: foldersData } = useDocumentFolders();
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();

  const documents = data?.data ?? [];
  const meta = data?.meta;
  const stats = statsData?.data;
  const serverFolders = foldersData?.data ?? [];

  const allFolders = [
    ...serverFolders,
    ...localFolders
      .filter((f) => !serverFolders.some((sf) => sf.folder === f))
      .map((f) => ({ folder: f, count: 0 })),
  ];

  const handleSubmit = (payload: {
    input: CreateDocumentInput | (UpdateDocumentInput & { id: string });
    files?: File[];
  }) => {
    if ('id' in payload.input) {
      const { id, ...input } = payload.input;
      updateDocument.mutate(
        { id, ...input },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setEditingDoc(null);
          },
        },
      );
    } else {
      createDocument.mutate(
        { data: payload.input, files: payload.files },
        {
          onSuccess: () => setDialogOpen(false),
        },
      );
    }
  };

  const handleFolderSelect = (folder: string | undefined) => {
    setFilters((prev) => ({ ...prev, folder }));
    setPage(1);
  };

  const handleCreateFolder = (folderPath: string) => {
    setLocalFolders((prev) => prev.includes(folderPath) ? prev : [...prev, folderPath]);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Document Vault</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Store and manage your important documents
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-md border border-border">
            {([
              { mode: 'grid' as const, label: 'Grid', icon: LayoutGrid },
              { mode: 'list' as const, label: 'List', icon: List },
            ]).map(({ mode, label, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => setView(mode)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors first:rounded-l-md last:rounded-r-md',
                  view === mode
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setEditingDoc(null);
              setDialogOpen(true);
            }}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
          >
            <Plus className="h-4 w-4" />
            Upload Document
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Documents"
            value={stats.total}
            icon={FileBox}
          />
          <StatCard
            label="Expiring Soon"
            value={stats.expiringSoon}
            subtitle="Within 30 days"
            icon={Clock}
            className={stats.expiringSoon > 0 ? 'border-warning/30' : undefined}
          />
          <StatCard
            label="Expired"
            value={stats.expired}
            icon={AlertTriangle}
            className={stats.expired > 0 ? 'border-danger/30' : undefined}
          />
          <StatCard
            label="Storage Used"
            value={formatStorageSize(stats.storageUsed)}
            icon={HardDrive}
          />
        </div>
      )}

      {/* Folder toggle + Filters */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setTreeOpen((o) => !o)}
          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-card-hover transition-colors"
          title={treeOpen ? 'Hide folder tree' : 'Show folder tree'}
        >
          {treeOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        </button>
        <div className="flex-1">
          <DocumentFilters filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} />
        </div>
      </div>

      {/* Main content area with folder tree */}
      <div className="flex gap-6">
        {/* Folder tree sidebar */}
        {treeOpen && (
          <div className="hidden md:block w-56 shrink-0">
            <div className="sticky top-20 rounded-lg border border-border bg-card p-3 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <DocumentFolderTree
                folders={allFolders}
                selectedFolder={filters.folder}
                onSelect={handleFolderSelect}
                onCreateFolder={handleCreateFolder}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {filters.folder && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Showing:</span>
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {filters.folder === '/' ? 'Root' : filters.folder}
              </span>
              <button
                onClick={() => handleFolderSelect(undefined)}
                className="rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                &times;
              </button>
            </div>
          )}

          {isLoading ? (
            <div className={cn(
              view === 'grid'
                ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
                : 'space-y-2',
            )}>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-lg border border-border bg-card animate-pulse',
                    view === 'grid' ? 'h-40' : 'h-16',
                  )}
                />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
              <FileBox className="h-12 w-12 text-muted" />
              <p className="mt-4 text-sm text-muted-foreground">No documents found</p>
              <p className="mt-1 text-xs text-muted">
                {filters.folder
                  ? 'No documents in this folder'
                  : 'Upload your first document to get started'}
              </p>
              <button
                onClick={() => {
                  setEditingDoc(null);
                  setDialogOpen(true);
                }}
                className="mt-4 flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
              >
                <Plus className="h-4 w-4" />
                Upload Document
              </button>
            </div>
          ) : view === 'grid' ? (
            <div className={cn(
              'grid grid-cols-1 gap-4 sm:grid-cols-2',
              !treeOpen && 'lg:grid-cols-3',
            )}>
              {documents.map((doc, i) => (
                <div
                  key={doc.id}
                  className="animate-card-in"
                  style={{ '--i': i } as React.CSSProperties}
                >
                  <DocumentCard document={doc} onClick={setSelectedDoc} />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc, i) => (
                <div
                  key={doc.id}
                  className="animate-card-in"
                  style={{ '--i': i } as React.CSSProperties}
                >
                  <DocumentItem document={doc} onClick={setSelectedDoc} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dialog & Detail Panel */}
      <DocumentDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingDoc(null);
        }}
        onSubmit={handleSubmit}
        document={editingDoc}
        folders={allFolders.map((f) => f.folder)}
        currentFolder={filters.folder}
      />

      <DocumentDetailPanel
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
      />
    </div>
  );
}
