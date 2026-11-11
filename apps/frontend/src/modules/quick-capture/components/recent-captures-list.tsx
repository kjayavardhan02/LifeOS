import { Trash2, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useRecentCaptures, useDeleteCapture } from '../hooks/use-quick-capture';
import { CaptureTypeBadge } from './capture-type-badge';
import type { QuickCaptureType } from '@lifeos/shared';

function getItemPath(type: QuickCaptureType, itemId: string | null): string | null {
  if (!itemId) return null;
  switch (type) {
    case 'task':
      return '/tasks';
    case 'expense':
      return '/finance';
    case 'note':
      return '/knowledge';
    case 'reminder':
      return '/reminders';
    case 'event':
      return '/calendar';
    default:
      return null;
  }
}

interface RecentCapturesListProps {
  limit?: number;
}

export function RecentCapturesList({ limit = 20 }: RecentCapturesListProps) {
  const { data, isLoading } = useRecentCaptures(limit);
  const deleteCapture = useDeleteCapture();
  const navigate = useNavigate();

  const captures = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-lg border border-border bg-card"
          />
        ))}
      </div>
    );
  }

  if (captures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
        <Clock className="h-8 w-8 text-muted mb-3" />
        <p className="text-sm text-muted-foreground">No recent captures</p>
        <p className="mt-1 text-xs text-muted">Use the input above or press Ctrl+Shift+Space anywhere</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {captures.map((capture, index) => {
        const path = getItemPath(capture.resolvedType as QuickCaptureType, capture.createdItemId);
        return (
          <div
            key={capture.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:border-border-hover transition-colors animate-card-in"
            style={{ '--i': index } as React.CSSProperties}
          >
            <CaptureTypeBadge type={capture.resolvedType as QuickCaptureType} />

            <div className="flex-1 min-w-0">
              <p className="truncate text-sm text-foreground">{capture.rawInput}</p>
              <p className="text-xs text-muted">
                {formatDistanceToNow(new Date(capture.createdAt), { addSuffix: true })}
                {capture.detectedType !== capture.resolvedType && (
                  <span className="ml-2">
                    (detected: {capture.detectedType})
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {path && (
                <button
                  onClick={() => navigate(path)}
                  className="rounded-md p-1.5 text-muted-foreground hover:text-primary transition-colors"
                  title="Go to item"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => deleteCapture.mutate(capture.id)}
                className="rounded-md p-1.5 text-muted-foreground hover:text-danger transition-colors"
                title="Remove from history"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
