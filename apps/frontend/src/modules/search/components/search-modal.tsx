import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, Clock, Trash2 } from 'lucide-react';
import { useSearch } from '../hooks/use-search';
import { SearchResultItem } from './search-result-item';
import type { SearchModule, SearchResults } from '@lifeos/shared';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MODULE_LABELS: Record<SearchModule, string> = {
  tasks: 'Tasks',
  transactions: 'Finance',
  events: 'Calendar',
  reminders: 'Reminders',
  projects: 'Projects',
  notes: 'Notes',
  documents: 'Documents',
  subscriptions: 'Subscriptions',
};

const MODULE_NAV_PATHS: Record<SearchModule, string> = {
  tasks: '/tasks',
  transactions: '/finance',
  events: '/calendar',
  reminders: '/reminders',
  projects: '/projects',
  notes: '/knowledge',
  documents: '/documents',
  subscriptions: '/subscriptions',
};

const ALL_MODULES: SearchModule[] = [
  'tasks',
  'transactions',
  'events',
  'reminders',
  'projects',
  'notes',
  'documents',
  'subscriptions',
];

const RECENT_SEARCHES_KEY = 'lifeos:recent-searches';
const MAX_RECENT_SEARCHES = 10;

function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is string => typeof s === 'string').slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
}

function addRecentSearch(query: string): void {
  const searches = getRecentSearches().filter((s) => s !== query);
  searches.unshift(query);
  localStorage.setItem(
    RECENT_SEARCHES_KEY,
    JSON.stringify(searches.slice(0, MAX_RECENT_SEARCHES)),
  );
}

function clearRecentSearches(): void {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

interface FlatResult {
  module: SearchModule;
  id: string;
  title: string;
  snippet: string | null;
  date: string;
}

function flattenResults(results: SearchResults | undefined): FlatResult[] {
  if (!results) return [];
  const flat: FlatResult[] = [];

  const addModule = (
    module: SearchModule,
    items: Array<{ id: string; title?: string; name?: string; description?: string | null; content?: string | null; updatedAt?: string; date?: string; startDate?: string; dueDate?: string; nextBillingDate?: string }>,
  ) => {
    for (const item of items) {
      flat.push({
        module,
        id: item.id,
        title: item.title ?? item.name ?? '',
        snippet: item.description ?? item.content ?? null,
        date:
          item.updatedAt ??
          item.date ??
          item.startDate ??
          item.dueDate ??
          item.nextBillingDate ??
          new Date().toISOString(),
      });
    }
  };

  addModule('tasks', results.tasks);
  addModule('transactions', results.transactions.map((t) => ({
    ...t,
    title: t.merchant ? `${t.category} - ${t.merchant}` : t.category,
    description: `${t.type === 'income' ? '+' : '-'}${t.amount}`,
  })));
  addModule('events', results.events);
  addModule('reminders', results.reminders);
  addModule('projects', results.projects);
  addModule('notes', results.notes);
  addModule('documents', results.documents);
  addModule('subscriptions', results.subscriptions.map((s) => ({
    ...s,
    title: s.name,
    description: s.provider,
  })));

  return flat;
}

interface GroupedResults {
  module: SearchModule;
  items: FlatResult[];
}

function groupResults(flat: FlatResult[]): GroupedResults[] {
  const groups: GroupedResults[] = [];
  const map = new Map<SearchModule, FlatResult[]>();

  for (const item of flat) {
    const existing = map.get(item.module);
    if (existing) {
      existing.push(item);
    } else {
      const arr = [item];
      map.set(item.module, arr);
      groups.push({ module: item.module, items: arr });
    }
  }

  return groups;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [inputValue, setInputValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SearchModule | 'all'>('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Load recent searches when modal opens
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
      // Auto-focus happens via autoFocus on the input
    }
  }, [isOpen]);

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setInputValue('');
      setDebouncedQuery('');
      setActiveFilter('all');
      setActiveIndex(0);
    }
  }, [isOpen]);

  const moduleFilter = activeFilter === 'all' ? undefined : activeFilter;
  const { data, isLoading, isFetching } = useSearch(debouncedQuery, {
    module: moduleFilter,
    limit: 10,
  });

  const results = data?.data;
  const flatResults = useMemo(() => flattenResults(results), [results]);
  const groupedResults = useMemo(() => groupResults(flatResults), [flatResults]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [flatResults.length, debouncedQuery, activeFilter]);

  const handleNavigate = useCallback(
    (item: FlatResult) => {
      addRecentSearch(inputValue.trim());
      onClose();
      navigate(MODULE_NAV_PATHS[item.module]);
    },
    [navigate, onClose, inputValue],
  );

  const handleRecentClick = useCallback(
    (search: string) => {
      setInputValue(search);
    },
    [],
  );

  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, flatResults.length - 1));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const item = flatResults[activeIndex];
        if (item) {
          handleNavigate(item);
        }
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, flatResults, activeIndex, handleNavigate]);

  // Scroll active item into view
  useEffect(() => {
    if (!resultsRef.current) return;
    const activeEl = resultsRef.current.querySelector('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  if (!isOpen) return null;

  const showLoading = isLoading || isFetching;
  const hasQuery = debouncedQuery.length >= 2;
  const hasResults = flatResults.length > 0;
  const showRecent = !inputValue && recentSearches.length > 0;

  // Track cumulative index for keyboard nav
  let cumulativeIndex = 0;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 animate-overlay-in"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-start justify-center pt-[12vh] px-6 pointer-events-none">
        <div className="relative w-full max-w-2xl rounded-lg border border-border bg-card shadow-2xl animate-dialog-in pointer-events-auto flex flex-col max-h-[70vh]">
          {/* Search Input */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            {showLoading ? (
              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin flex-shrink-0" />
            ) : (
              <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search across all modules..."
              className="flex-1 bg-transparent text-lg text-foreground placeholder:text-muted outline-none"
              autoFocus
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => setInputValue('')}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex rounded border border-border bg-background px-1.5 py-0.5 text-xs text-muted flex-shrink-0">
              ESC
            </kbd>
          </div>

          {/* Module Filter Pills */}
          {hasQuery && (
            <div className="flex items-center gap-1.5 border-b border-border px-4 py-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  activeFilter === 'all'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-border-hover'
                }`}
              >
                All
              </button>
              {ALL_MODULES.map((mod) => (
                <button
                  key={mod}
                  type="button"
                  onClick={() => setActiveFilter(mod)}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    activeFilter === mod
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground hover:border-border-hover'
                  }`}
                >
                  {MODULE_LABELS[mod]}
                </button>
              ))}
            </div>
          )}

          {/* Results Area */}
          <div ref={resultsRef} className="overflow-y-auto flex-1">
            {/* Recent Searches (when input is empty) */}
            {showRecent && (
              <div className="py-2">
                <div className="flex items-center justify-between px-4 py-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                    <Clock className="h-3 w-3" />
                    Recent Searches
                  </div>
                  <button
                    type="button"
                    onClick={handleClearRecent}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear
                  </button>
                </div>
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    type="button"
                    onClick={() => handleRecentClick(search)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-muted-foreground hover:bg-card-hover hover:text-foreground transition-colors"
                  >
                    <Search className="h-3.5 w-3.5 flex-shrink-0" />
                    {search}
                  </button>
                ))}
              </div>
            )}

            {/* No input hint */}
            {!inputValue && !showRecent && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Search className="h-8 w-8 mb-3 text-muted" />
                <p className="text-sm">Type to search across all modules</p>
                <p className="text-xs text-muted mt-1">
                  Tasks, finance, calendar, reminders, projects, notes, documents, subscriptions
                </p>
              </div>
            )}

            {/* Loading skeleton */}
            {hasQuery && showLoading && !hasResults && (
              <div className="py-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="h-4 w-4 rounded bg-card-hover animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 w-48 rounded bg-card-hover animate-pulse" />
                      <div className="h-3 w-32 rounded bg-card-hover animate-pulse mt-1" />
                    </div>
                    <div className="h-3 w-16 rounded bg-card-hover animate-pulse" />
                  </div>
                ))}
              </div>
            )}

            {/* No results */}
            {hasQuery && !showLoading && !hasResults && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Search className="h-8 w-8 mb-3 text-muted" />
                <p className="text-sm">
                  No results for <span className="text-foreground font-medium">&ldquo;{debouncedQuery}&rdquo;</span>
                </p>
                <p className="text-xs text-muted mt-1">Try a different search term or filter</p>
              </div>
            )}

            {/* Grouped Results */}
            {hasQuery && hasResults && (
              <div className="py-1">
                {groupedResults.map((group) => {
                  const startIndex = cumulativeIndex;
                  cumulativeIndex += group.items.length;

                  return (
                    <div key={group.module}>
                      <div className="flex items-center gap-2 px-4 py-1.5 mt-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                          {MODULE_LABELS[group.module]}
                        </span>
                        <span className="text-xs text-muted">({group.items.length})</span>
                      </div>
                      {group.items.map((item, idx) => {
                        const globalIdx = startIndex + idx;
                        return (
                          <div
                            key={`${item.module}-${item.id}`}
                            data-active={globalIdx === activeIndex ? 'true' : undefined}
                          >
                            <SearchResultItem
                              module={item.module}
                              title={item.title}
                              snippet={item.snippet}
                              date={item.date}
                              query={debouncedQuery}
                              isActive={globalIdx === activeIndex}
                              onClick={() => handleNavigate(item)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer hints */}
          <div className="border-t border-border px-4 py-2 flex items-center gap-4">
            <div className="flex items-center gap-1 text-xs text-muted">
              <kbd className="rounded border border-border bg-background px-1 py-0.5 text-[10px]">&uarr;&darr;</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted">
              <kbd className="rounded border border-border bg-background px-1 py-0.5 text-[10px]">&crarr;</kbd>
              <span>Open</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted">
              <kbd className="rounded border border-border bg-background px-1 py-0.5 text-[10px]">esc</kbd>
              <span>Close</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
