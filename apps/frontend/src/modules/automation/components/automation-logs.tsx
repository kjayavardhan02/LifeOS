import { CheckCircle, XCircle, Clock } from 'lucide-react';
import type { AutomationLog } from '../hooks/use-automation';

interface AutomationLogsProps {
  logs: AutomationLog[];
}

export function AutomationLogs({ logs }: AutomationLogsProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <Clock className="h-8 w-8 text-muted mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No automation logs yet. Logs appear here when rules are triggered.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-card-hover">
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Rule</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Trigger</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Actions</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b border-border/50 last:border-0 hover:bg-card-hover/50 transition-colors">
              <td className="px-4 py-2.5">
                {log.status === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <XCircle className="h-4 w-4 text-danger" />
                )}
              </td>
              <td className="px-4 py-2.5 font-medium text-foreground">{log.ruleName}</td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {formatTrigger(log.trigger)}
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {Array.isArray(log.actions) ? log.actions.length : 0} action{Array.isArray(log.actions) && log.actions.length !== 1 ? 's' : ''}
              </td>
              <td className="px-4 py-2.5 text-xs text-muted">
                {formatTime(log.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatTrigger(trigger: Record<string, unknown>): string {
  if (trigger['eventName']) return String(trigger['eventName']);
  if (trigger['cron']) return `cron: ${String(trigger['cron'])}`;
  return 'manual';
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
