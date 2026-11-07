import { Search, Bell } from 'lucide-react';

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
      <div className="text-sm text-muted-foreground">
        {/* Breadcrumb will be populated by route context */}
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-border-hover hover:text-foreground">
          <Search className="h-3.5 w-3.5" />
          <span>Search...</span>
          <kbd className="ml-4 rounded border border-border bg-background px-1.5 py-0.5 text-xs text-muted">
            ⌘K
          </kbd>
        </button>

        <button className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-card-hover hover:text-foreground">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary">
          J
        </div>
      </div>
    </header>
  );
}
