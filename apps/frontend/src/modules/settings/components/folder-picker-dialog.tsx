import { useState, useEffect, useCallback } from 'react';
import { Folder, FolderOpen, ChevronRight, ArrowUp, Home, X, Check, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface DirectoryEntry {
  name: string;
  path: string;
  hasChildren: boolean;
}

interface BrowseResponse {
  data: {
    current: string;
    parent: string | null;
    directories: DirectoryEntry[];
  };
}

interface FolderPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
  initialPath?: string;
}

export function FolderPickerDialog({ open, onClose, onSelect, initialPath }: FolderPickerDialogProps) {
  const [currentPath, setCurrentPath] = useState('');
  const [parentPath, setParentPath] = useState<string | null>(null);
  const [directories, setDirectories] = useState<DirectoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualPath, setManualPath] = useState('');

  const browse = useCallback(async (path?: string) => {
    setLoading(true);
    setError(null);
    try {
      const query = path ? `?path=${encodeURIComponent(path)}` : '';
      const res = await api.get<BrowseResponse>(`/profile/browse-dirs${query}`);
      setCurrentPath(res.data.current);
      setParentPath(res.data.parent);
      setDirectories(res.data.directories);
      setManualPath(res.data.current);
    } catch {
      setError('Cannot access this directory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      browse(initialPath || undefined);
    }
  }, [open, initialPath, browse]);

  const handleManualNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualPath.trim()) browse(manualPath.trim());
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 animate-overlay-in" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-lg border border-border bg-card shadow-xl animate-dialog-in mx-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-base font-semibold text-foreground">Select Obsidian Vault Folder</h3>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Path bar */}
        <form onSubmit={handleManualNavigate} className="flex items-center gap-2 border-b border-border px-5 py-2.5">
          <input
            type="text"
            value={manualPath}
            onChange={(e) => setManualPath(e.target.value)}
            className="h-8 flex-1 rounded-md border border-border bg-input px-2.5 text-xs text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono"
            placeholder="/path/to/vault"
          />
          <button
            type="submit"
            className="rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Go
          </button>
        </form>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1 border-b border-border px-5 py-2">
          <button
            onClick={() => browse(undefined)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-card-hover transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            Home
          </button>
          {parentPath && (
            <button
              onClick={() => browse(parentPath)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-card-hover transition-colors"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              Up
            </button>
          )}
          <div className="ml-auto text-xs text-muted truncate max-w-[200px]" title={currentPath}>
            {currentPath}
          </div>
        </div>

        {/* Directory listing */}
        <div className="h-72 overflow-y-auto px-2 py-2">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-danger">{error}</p>
            </div>
          ) : directories.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">No subdirectories</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {directories.map((dir) => (
                <button
                  key={dir.path}
                  onClick={() => browse(dir.path)}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left hover:bg-card-hover transition-colors group"
                >
                  <FolderOpen className="h-4 w-4 shrink-0 text-warning" />
                  <span className="flex-1 truncate text-sm text-foreground">{dir.name}</span>
                  {dir.hasChildren && (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0 flex-1 mr-3">
            <Folder className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate font-mono">{currentPath}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSelect(currentPath);
                onClose();
              }}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              Select This Folder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
