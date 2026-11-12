import { useState } from 'react';
import { Plus, BookMarked, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useContentItems,
  useCreateContentItem,
  useUpdateContentItem,
  useDeleteContentItem,
  useToggleFavorite,
  useCollections,
  useCreateCollection,
  useUpdateCollection,
  useDeleteCollection,
  useReadingStats,
} from '../hooks/use-reading';
import { ContentFilters } from '../components/content-filters';
import { ContentItemCard } from '../components/content-item-card';
import { ContentItemDialog } from '../components/content-item-dialog';
import { ContentDetailPanel } from '../components/content-detail-panel';
import { CollectionCard } from '../components/collection-card';
import { CollectionDialog } from '../components/collection-dialog';
import { ReadingStatsSection } from '../components/reading-stats';
import type {
  ContentItem,
  ContentCollection,
  ContentItemFilters,
  CreateContentItemInput,
  UpdateContentItemInput,
  CreateCollectionInput,
  UpdateCollectionInput,
} from '@lifeos/shared';

type Tab = 'library' | 'collections' | 'stats';

export function ReadingPage() {
  const [tab, setTab] = useState<Tab>('library');
  const [filters, setFilters] = useState<ContentItemFilters>({});
  const [page, setPage] = useState(1);

  // Item dialog state
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  // Collection dialog state
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<ContentCollection | null>(null);
  const [activeCollectionFilter, setActiveCollectionFilter] = useState<string | null>(null);

  // Queries
  const { data: itemsData, isLoading: itemsLoading } = useContentItems({
    ...filters,
    ...(activeCollectionFilter ? { collectionId: activeCollectionFilter } : {}),
    page,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const { data: collectionsData, isLoading: collectionsLoading } = useCollections();
  const { data: statsData, isLoading: statsLoading } = useReadingStats();

  // Mutations
  const createItem = useCreateContentItem();
  const updateItem = useUpdateContentItem();
  const deleteItem = useDeleteContentItem();
  const toggleFavorite = useToggleFavorite();
  const createCollection = useCreateCollection();
  const updateCollection = useUpdateCollection();
  const deleteCollection = useDeleteCollection();

  const items = itemsData?.data ?? [];
  const meta = itemsData?.meta;
  const collections = collectionsData?.data ?? [];
  const stats = statsData?.data;

  // Handlers
  const handleItemSubmit = (
    input: CreateContentItemInput | (UpdateContentItemInput & { id: string }),
  ) => {
    if ('id' in input) {
      updateItem.mutate(input, {
        onSuccess: () => {
          setItemDialogOpen(false);
          setEditingItem(null);
        },
      });
    } else {
      createItem.mutate(input, {
        onSuccess: () => setItemDialogOpen(false),
      });
    }
  };

  const handleCollectionSubmit = (
    input: CreateCollectionInput | (UpdateCollectionInput & { id: string }),
  ) => {
    if ('id' in input) {
      updateCollection.mutate(input, {
        onSuccess: () => {
          setCollectionDialogOpen(false);
          setEditingCollection(null);
        },
      });
    } else {
      createCollection.mutate(input, {
        onSuccess: () => setCollectionDialogOpen(false),
      });
    }
  };

  const handleCollectionClick = (collection: ContentCollection) => {
    setActiveCollectionFilter(collection.id);
    setTab('library');
    setPage(1);
  };

  const clearCollectionFilter = () => {
    setActiveCollectionFilter(null);
    setPage(1);
  };

  const activeCollection = activeCollectionFilter
    ? collections.find((c) => c.id === activeCollectionFilter)
    : null;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-page-in">
        <div>
          <div className="flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-[#5B9BF0]" />
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Reading</h1>
          </div>
          <p className="mt-1 text-sm text-muted">
            Track articles, books, videos, and podcasts
          </p>
        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setItemDialogOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B9BF0] to-[#3D6FBF] px-5 py-2 text-sm font-medium text-white shadow-[0_2px_12px_rgba(91,155,240,0.3)] hover:shadow-[0_4px_20px_rgba(91,155,240,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Content
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex items-center gap-6 border-b border-border">
        {([
          { key: 'library', label: 'Library' },
          { key: 'collections', label: 'Collections' },
          { key: 'stats', label: 'Stats' },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              if (t.key !== 'library') {
                setActiveCollectionFilter(null);
              }
            }}
            className={cn(
              'pb-2 text-sm font-medium transition-colors border-b-2 -mb-px',
              tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Library Tab */}
      {tab === 'library' && (
        <div>
          {/* Filter bar */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ContentFilters filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} />
          </div>

          {/* Active collection filter banner */}
          {activeCollection && (
            <div
              className="mb-4 flex items-center justify-between rounded-lg border px-4 py-2.5"
              style={{
                borderColor: `${activeCollection.color}30`,
                backgroundColor: `${activeCollection.color}08`,
              }}
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" style={{ color: activeCollection.color }} />
                <span className="text-sm font-medium text-foreground">
                  Collection: {activeCollection.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({meta?.total ?? 0} items)
                </span>
              </div>
              <button
                onClick={clearCollectionFilter}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear filter
              </button>
            </div>
          )}

          {itemsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-xl border border-border bg-card animate-pulse"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
              <BookMarked className="h-10 w-10 text-muted" />
              <p className="mt-3 text-sm text-muted-foreground">
                No content found
              </p>
              <p className="mt-1 text-xs text-muted">
                {Object.keys(filters).length > 0 || activeCollectionFilter
                  ? 'Try adjusting your filters'
                  : 'Add your first article, book, video, or podcast'}
              </p>
              {!Object.keys(filters).length && !activeCollectionFilter && (
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setItemDialogOpen(true);
                  }}
                  className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B9BF0] to-[#3D6FBF] px-5 py-2 text-sm font-medium text-white shadow-[0_2px_12px_rgba(91,155,240,0.3)] hover:shadow-[0_4px_20px_rgba(91,155,240,0.4)] transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Add Content
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={item.id} className="animate-card-in" style={{ '--i': i } as React.CSSProperties}>
                    <ContentItemCard
                      item={item}
                      onEdit={(it) => {
                        setEditingItem(it);
                        setItemDialogOpen(true);
                      }}
                      onDelete={(id) => deleteItem.mutate(id)}
                      onClick={(it) => setSelectedItem(it)}
                      onToggleFavorite={(id, isFav) => toggleFavorite.mutate({ id, isFavorite: isFav })}
                    />
                  </div>
                ))}
              </div>

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
            </>
          )}
        </div>
      )}

      {/* Collections Tab */}
      {tab === 'collections' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {collections.length} collection{collections.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={() => {
                setEditingCollection(null);
                setCollectionDialogOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B9BF0] to-[#3D6FBF] px-5 py-2 text-sm font-medium text-white shadow-[0_2px_12px_rgba(91,155,240,0.3)] hover:shadow-[0_4px_20px_rgba(91,155,240,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              New Collection
            </button>
          </div>

          {collectionsLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 rounded-xl border border-border bg-card animate-pulse"
                />
              ))}
            </div>
          ) : collections.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
              <FolderOpen className="h-10 w-10 text-muted" />
              <p className="mt-3 text-sm text-muted-foreground">
                No collections yet
              </p>
              <p className="mt-1 text-xs text-muted">
                Organize your content into collections
              </p>
              <button
                onClick={() => {
                  setEditingCollection(null);
                  setCollectionDialogOpen(true);
                }}
                className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B9BF0] to-[#3D6FBF] px-5 py-2 text-sm font-medium text-white shadow-[0_2px_12px_rgba(91,155,240,0.3)] hover:shadow-[0_4px_20px_rgba(91,155,240,0.4)] transition-all"
              >
                <Plus className="h-4 w-4" />
                Create Collection
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection, i) => (
                <div key={collection.id} className="animate-card-in" style={{ '--i': i } as React.CSSProperties}>
                  <CollectionCard
                    collection={collection}
                    onEdit={(c) => {
                      setEditingCollection(c);
                      setCollectionDialogOpen(true);
                    }}
                    onDelete={(id) => deleteCollection.mutate(id)}
                    onClick={handleCollectionClick}
                  />
                </div>
              ))}
            </div>
          )}

          <CollectionDialog
            open={collectionDialogOpen}
            onClose={() => {
              setCollectionDialogOpen(false);
              setEditingCollection(null);
            }}
            onSubmit={handleCollectionSubmit}
            collection={editingCollection}
          />
        </div>
      )}

      {/* Stats Tab */}
      {tab === 'stats' && (
        <ReadingStatsSection stats={stats} isLoading={statsLoading} />
      )}

      {/* Content item dialog */}
      <ContentItemDialog
        open={itemDialogOpen}
        onClose={() => {
          setItemDialogOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleItemSubmit}
        item={editingItem}
        collections={collections}
      />

      {/* Detail panel */}
      <ContentDetailPanel
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
