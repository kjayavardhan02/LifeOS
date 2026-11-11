import { Zap } from 'lucide-react';
import { CaptureInput } from '../components/capture-input';
import { RecentCapturesList } from '../components/recent-captures-list';

export function QuickCapturePage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Quick Capture</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Type anything to quickly create tasks, expenses, notes, reminders, or events.
          Auto-detection figures out the type for you.
        </p>
      </div>

      {/* Capture input */}
      <div className="rounded-lg border border-border bg-card p-5">
        <CaptureInput autoFocus />
      </div>

      {/* Recent captures */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          Recent Captures
        </h2>
        <RecentCapturesList limit={30} />
      </div>
    </div>
  );
}
