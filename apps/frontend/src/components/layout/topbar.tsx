import { useState, useEffect, useCallback } from 'react';
import { Search, Bell } from 'lucide-react';
import { UserDropdown } from './user-dropdown';
import { SearchModal } from '@/modules/search';

export function TopBar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  // Global keyboard shortcut: Cmd+K / Ctrl+K and / key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

      // / key — only when not in an input, textarea, or contentEditable
      if (e.key === '/' && !isSearchOpen) {
        const target = e.target as HTMLElement;
        const tagName = target.tagName.toLowerCase();
        if (
          tagName === 'input' ||
          tagName === 'textarea' ||
          tagName === 'select' ||
          target.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-topbar px-6">
        <div className="text-sm text-muted-foreground">
          {/* Breadcrumb will be populated by route context */}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openSearch}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-border-hover hover:text-foreground"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search or jump to...</span>
            <kbd className="ml-4 rounded border border-border bg-background px-1.5 py-0.5 text-xs text-muted">
              ⌘K
            </kbd>
          </button>

          <span className="rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-muted-foreground">
            v1
          </span>

          <button className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-card-hover hover:text-foreground">
            <Bell className="h-4.5 w-4.5" />
          </button>

          <UserDropdown />
        </div>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />
    </>
  );
}
