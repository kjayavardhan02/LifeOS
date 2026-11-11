import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FolderEntry } from '../hooks/use-knowledge';

interface TreeNode {
  name: string;
  path: string;
  count: number;
  children: TreeNode[];
}

function buildTree(entries: FolderEntry[]): TreeNode[] {
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

interface FolderTreeProps {
  folders: FolderEntry[];
  selectedFolder: string | undefined;
  onSelect: (folder: string | undefined) => void;
}

export function FolderTree({ folders, selectedFolder, onSelect }: FolderTreeProps) {
  const tree = buildTree(folders);
  const totalCount = folders.reduce((sum, f) => sum + f.count, 0);

  return (
    <div className="flex flex-col">
      <div className="mb-2 px-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">Folders</span>
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
        <BookOpen className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">All Notes</span>
        <span className="text-xs tabular-nums text-muted">{totalCount}</span>
      </button>

      <div className="mt-1 space-y-0.5">
        {tree.map((node) => (
          <TreeItem
            key={node.path}
            node={node}
            depth={0}
            selectedFolder={selectedFolder}
            onSelect={onSelect}
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
}

function TreeItem({ node, depth, selectedFolder, onSelect }: TreeItemProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedFolder === node.path;

  return (
    <div>
      <button
        onClick={() => {
          onSelect(node.path);
          if (hasChildren && isSelected) setExpanded((e) => !e);
        }}
        className={cn(
          'flex w-full items-center gap-1.5 rounded-md py-1.5 text-sm transition-colors',
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

      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedFolder={selectedFolder}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
