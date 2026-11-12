import { useState, useEffect, useCallback } from 'react';
import { Search, Bell } from 'lucide-react';
import { UserDropdown } from './user-dropdown';
import { SearchModal } from '@/modules/search';

export function TopBar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

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
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border glass px-6">
        <div className="text-sm text-muted-foreground" />

        <div className="flex items-center gap-3">
          <button
            onClick={openSearch}
            className="group flex items-center gap-2.5 rounded-xl border border-border bg-background/50 px-4 py-1.5 text-sm text-muted transition-all hover:border-[#5B9BF0]/30 hover:bg-[#5B9BF0]/5 hover:text-muted-foreground"
          >
            <Search className="h-3.5 w-3.5 text-muted group-hover:text-[#5B9BF0] transition-colors" />
            <span>Search or jump to...</span>
            <kbd className="ml-4 rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted">
              /
            </kbd>
          </button>

          <span className="rounded-lg bg-[#5B9BF0]/10 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-[#5B9BF0] uppercase">
            v1
          </span>

          <button className="relative rounded-lg p-2 text-muted-foreground transition-all hover:bg-card-hover hover:text-foreground">
            <Bell className="h-[18px] w-[18px]" />
          </button>

          <UserDropdown />
        </div>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />
    </>
  );
}
