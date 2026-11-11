import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, FolderPlus, FileBox, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DocumentFolderEntry } from '@lifeos/shared';

interface TreeNode {
  name: string;
  path: string;
  count: number;
  children: TreeNode[];
}

function buildTree(entries: DocumentFolderEntry[]): TreeNode[] {
  const root: TreeNode[] = [];
  const map = new Map<string, TreeNode>();

  for (const { folder, count } of entries) {
    if (folder === '/') {
      const node: TreeNode = { name: 'Root', path: '/', count, children: [] };
      map.set('/', node);
      root.push(node);
      continue;
    }

    const parts = folder.split('/');
    let currentPath = '';

    for (let i = 0; i < parts.length; i++) {
      const parentPath = currentPath;
      currentPath = i === 0 ? parts[i] : `${currentPath}/${parts[i]}`;

      if (!map.has(currentPath)) {
        const node: TreeNode = {
          name: parts[i],
          path: currentPath,
          count: 0,
          children: [],
        };
        map.set(currentPath, node);

        if (i === 0) {
          root.push(node);
        } else {
          const parent = map.get(parentPath);
          if (parent) parent.children.push(node);
        }
      }

      if (i === parts.length - 1) {
        const node = map.get(currentPath)!;
        node.count = count;
      }
    }
  }

  return root;
}

interface DocumentFolderTreeProps {
  folders: DocumentFolderEntry[];
  selectedFolder: string | undefined;
  onSelect: (folder: string | undefined) => void;
  onCreateFolder: (parentPath: string) => void;
}

export function DocumentFolderTree({ folders, selectedFolder, onSelect, onCreateFolder }: DocumentFolderTreeProps) {
  const tree = buildTree(folders);
  const totalCount = folders.reduce((sum, f) => sum + f.count, 0);
  const [creatingIn, setCreatingIn] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreate = (parentPath: string) => {
    if (!newFolderName.trim()) {
      setCreatingIn(null);
      return;
    }
    const fullPath = parentPath === '/' || parentPath === ''
      ? newFolderName.trim()
      : `${parentPath}/${newFolderName.trim()}`;
    onCreateFolder(fullPath);
    setNewFolderName('');
    setCreatingIn(null);
  };

  return (
    <div className="flex flex-col">
      <div className="mb-2 flex items-center justify-between px-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">Folders</span>
        <button
          onClick={() => {
            setCreatingIn('');
            setNewFolderName('');
          }}
          className="rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
          title="New folder"
        >
          <FolderPlus className="h-3.5 w-3.5" />
        </button>
      </div>

      <button
        onClick={() => onSelect(undefined)}
        className={cn(
          'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
          selectedFolder === undefined
            ? 'bg-primary/15 text-primary font-medium'
            : 'text-muted-foreground hover:text-foreground hover:bg-card-hover',
        )}
      >
        <FileBox className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">All Documents</span>
        <span className="text-xs tabular-nums text-muted">{totalCount}</span>
      </button>

      {creatingIn === '' && (
        <div className="mt-1 flex items-center gap-1 px-2">
          <FolderOpen className="h-4 w-4 shrink-0 text-warning" />
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate('');
              if (e.key === 'Escape') setCreatingIn(null);
            }}
            placeholder="Folder name"
            className="flex-1 rounded border border-border bg-input px-2 py-0.5 text-xs text-foreground outline-none focus:border-primary"
            autoFocus
            onBlur={() => handleCreate('')}
          />
          <button onClick={() => setCreatingIn(null)} className="rounded p-0.5 text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <div className="mt-1 space-y-0.5">
        {tree.map((node) => (
          <TreeItem
            key={node.path}
            node={node}
            depth={0}
            selectedFolder={selectedFolder}
            onSelect={onSelect}
            creatingIn={creatingIn}
            onStartCreate={(path) => { setCreatingIn(path); setNewFolderName(''); }}
            onCancelCreate={() => setCreatingIn(null)}
            newFolderName={newFolderName}
            onNewFolderNameChange={setNewFolderName}
            onConfirmCreate={handleCreate}
          />
        ))}
      </div>
    </div>
  );
}

interface TreeItemProps {
  node: TreeNode;
  depth: number;
  selectedFolder: string | undefined;
  onSelect: (folder: string | undefined) => void;
  creatingIn: string | null;
  onStartCreate: (path: string) => void;
  onCancelCreate: () => void;
  newFolderName: string;
  onNewFolderNameChange: (name: string) => void;
  onConfirmCreate: (parentPath: string) => void;
}

function TreeItem({
  node,
  depth,
  selectedFolder,
  onSelect,
  creatingIn,
  onStartCreate,
  onCancelCreate,
  newFolderName,
  onNewFolderNameChange,
  onConfirmCreate,
}: TreeItemProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0 || creatingIn === node.path;
  const isSelected = selectedFolder === node.path;

  return (
    <div>
      <div className="group flex items-center">
        <button
          onClick={() => {
            onSelect(node.path);
            if (hasChildren && isSelected) setExpanded((e) => !e);
          }}
          className={cn(
            'flex flex-1 items-center gap-1.5 rounded-md py-1.5 text-sm transition-colors',
            isSelected
              ? 'bg-primary/15 text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-card-hover',
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px`, paddingRight: '8px' }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((prev) => !prev);
              }}
              className="shrink-0 rounded p-0.5 hover:bg-border/50 transition-colors"
            >
              {expanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          ) : (
            <span className="w-4 shrink-0" />
          )}

          {isSelected || expanded ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-warning" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-warning" />
          )}

          <span className="flex-1 truncate text-left">{node.name}</span>
          <span className="text-xs tabular-nums text-muted">{node.count}</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStartCreate(node.path);
            setExpanded(true);
          }}
          className="mr-1 hidden rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors group-hover:block"
          title="New subfolder"
        >
          <FolderPlus className="h-3 w-3" />
        </button>
      </div>

      {expanded && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedFolder={selectedFolder}
              onSelect={onSelect}
              creatingIn={creatingIn}
              onStartCreate={onStartCreate}
              onCancelCreate={onCancelCreate}
              newFolderName={newFolderName}
              onNewFolderNameChange={onNewFolderNameChange}
              onConfirmCreate={onConfirmCreate}
            />
          ))}
          {creatingIn === node.path && (
            <div
              className="flex items-center gap-1 py-0.5"
              style={{ paddingLeft: `${(depth + 1) * 16 + 8 + 20}px`, paddingRight: '8px' }}
            >
              <FolderOpen className="h-3.5 w-3.5 shrink-0 text-warning" />
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => onNewFolderNameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onConfirmCreate(node.path);
                  if (e.key === 'Escape') onCancelCreate();
                }}
                placeholder="Folder name"
                className="flex-1 rounded border border-border bg-input px-2 py-0.5 text-xs text-foreground outline-none focus:border-primary"
                autoFocus
                onBlur={() => onConfirmCreate(node.path)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
