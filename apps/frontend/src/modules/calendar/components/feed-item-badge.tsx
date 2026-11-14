import { CheckSquare, Bell, CreditCard, Calendar, type LucideIcon } from 'lucide-react';
import type { CalendarFeedSource } from '@lifeos/shared';

export const FEED_SOURCE_ICON: Record<CalendarFeedSource, LucideIcon> = {
  task: CheckSquare,
  reminder: Bell,
  subscription: CreditCard,
  event: Calendar,
};

export const FEED_SOURCE_LABEL: Record<CalendarFeedSource, string> = {
  task: 'Task',
  reminder: 'Reminder',
  subscription: 'Renewal',
  event: 'Event',
};

interface FeedItemBadgeProps {
  source: CalendarFeedSource;
  className?: string;
}

export function FeedItemBadge({ source, className }: FeedItemBadgeProps) {
  const Icon = FEED_SOURCE_ICON[source];
  return (
    <span className={`inline-flex items-center gap-1 ${className ?? ''}`}>
      <Icon className="h-3 w-3 shrink-0" />
      <span>{FEED_SOURCE_LABEL[source]}</span>
    </span>
  );
}
