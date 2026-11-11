import { type ReactNode, useMemo } from 'react';
import {
  CheckSquare,
  IndianRupee,
  Calendar,
  Bell,
  FolderKanban,
  FileText,
  CreditCard,
} from 'lucide-react';
import type { SearchModule } from '@lifeos/shared';
import { formatDistanceToNow } from 'date-fns';

interface SearchResultItemProps {
  module: SearchModule;
  title: string;
  snippet: string | null;
  date: string;
  query: string;
  isActive: boolean;
  onClick: () => void;
}

const MODULE_ICONS: Record<SearchModule, ReactNode> = {
  tasks: <CheckSquare className="h-4 w-4 text-primary" />,
  transactions: <IndianRupee className="h-4 w-4 text-success" />,
  events: <Calendar className="h-4 w-4 text-chart-2" />,
  reminders: <Bell className="h-4 w-4 text-warning" />,
  projects: <FolderKanban className="h-4 w-4 text-info" />,
  notes: <FileText className="h-4 w-4 text-chart-6" />,
  documents: <FileText className="h-4 w-4 text-primary" />,
  subscriptions: <CreditCard className="h-4 w-4 text-danger" />,
};

function highlightMatch(text: string, query: string): ReactNode {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <span key={i} className="text-primary font-medium">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function truncateSnippet(text: string | null, maxLen: number): string {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...';
}

export function SearchResultItem({
  module,
  title,
  snippet,
  date,
  query,
  isActive,
  onClick,
}: SearchResultItemProps) {
  const icon = MODULE_ICONS[module];
  const relativeDate = useMemo(() => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return '';
    }
  }, [date]);

  const truncatedSnippet = truncateSnippet(snippet, 100);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
        isActive ? 'bg-card-hover' : 'hover:bg-card-hover'
      }`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm text-foreground">
          {highlightMatch(title, query)}
        </div>
        {truncatedSnippet && (
          <div className="truncate text-xs text-muted-foreground mt-0.5">
            {highlightMatch(truncatedSnippet, query)}
          </div>
        )}
      </div>
      <div className="flex-shrink-0 text-xs text-muted">{relativeDate}</div>
    </button>
  );
}
