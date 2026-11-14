import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { X, ArrowRight } from 'lucide-react';
import type { CalendarFeedItem, CalendarFeedSource } from '@lifeos/shared';
import { FeedItemBadge } from './feed-item-badge';

interface FeedItemPopoverProps {
  item: CalendarFeedItem | null;
  onClose: () => void;
}

const SOURCE_ROUTE: Record<CalendarFeedSource, string> = {
  task: '/tasks',
  reminder: '/reminders',
  subscription: '/subscriptions',
  event: '/calendar',
};

const SOURCE_NAV_LABEL: Record<CalendarFeedSource, string> = {
  task: 'Go to Task',
  reminder: 'Go to Reminder',
  subscription: 'Go to Subscription',
  event: 'Go to Calendar',
};

export function FeedItemPopover({ item, onClose }: FeedItemPopoverProps) {
  const navigate = useNavigate();

  if (!item) return null;

  const handleNavigate = () => {
    navigate(SOURCE_ROUTE[item.source]);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 animate-overlay-in" onClick={onClose} />
      <div className="absolute inset-0 overflow-hidden flex items-center justify-center p-6 pointer-events-none">
        <div className="relative w-full max-w-sm rounded-lg border border-border bg-card shadow-2xl animate-dialog-in pointer-events-auto">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <FeedItemBadge
              source={item.source}
              className="text-xs font-medium"
            />
            <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm font-medium text-foreground">{item.title}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {item.isAllDay
                ? format(new Date(item.startDate), 'EEEE, MMMM d, yyyy')
                : format(new Date(item.startDate), 'EEEE, MMMM d, yyyy · h:mm a')}
            </p>
            <p className="text-xs text-muted">This is a read-only reference from another module.</p>
          </div>
          <div className="border-t border-border p-3">
            <button
              onClick={handleNavigate}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
            >
              {SOURCE_NAV_LABEL[item.source]}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
