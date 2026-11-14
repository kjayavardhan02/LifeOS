import { Zap, ZapOff, Pencil, Trash2, Clock, Calendar, Activity } from 'lucide-react';
import type { AutomationRule } from '../hooks/use-automation';

const TRIGGER_ICONS: Record<string, typeof Zap> = {
  event: Zap,
  schedule: Calendar,
  threshold: Activity,
};

interface RuleListProps {
  rules: AutomationRule[];
  onEdit: (rule: AutomationRule) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
}

export function RuleList({ rules, onEdit, onDelete, onToggle }: RuleListProps) {
  if (rules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center">
        <Zap className="h-10 w-10 text-muted mb-3" />
        <p className="text-sm font-medium text-foreground">No automation rules yet</p>
        <p className="text-xs text-muted-foreground mt-1">Create your first rule to automate cross-module workflows.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rules.map((rule) => {
        const TriggerIcon = TRIGGER_ICONS[rule.triggerType] ?? Zap;
        const triggerLabel = rule.triggerType === 'event'
          ? (rule.triggerConfig as Record<string, string>)['eventName'] ?? 'event'
          : rule.triggerType === 'schedule'
            ? (rule.triggerConfig as Record<string, string>)['cron'] ?? 'schedule'
            : 'threshold';

        return (
          <div
            key={rule.id}
            className={`group rounded-lg border bg-card p-4 transition-colors ${
              rule.isActive ? 'border-border hover:border-border-hover' : 'border-border/50 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <TriggerIcon className={`h-4 w-4 shrink-0 ${rule.isActive ? 'text-primary' : 'text-muted'}`} />
                  <h3 className="text-sm font-medium text-foreground truncate">{rule.name}</h3>
                </div>
                {rule.description && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1 ml-6">{rule.description}</p>
                )}
                <div className="mt-2 flex items-center gap-3 ml-6">
                  <span className="inline-flex items-center rounded-md bg-card-hover px-2 py-0.5 text-xs text-muted-foreground">
                    {rule.triggerType}: {triggerLabel}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {rule.actions.length} action{rule.actions.length !== 1 ? 's' : ''}
                  </span>
                  {rule.triggerCount > 0 && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {rule.triggerCount} run{rule.triggerCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onToggle(rule.id, !rule.isActive)}
                  className={`rounded-md p-1.5 transition-colors ${
                    rule.isActive
                      ? 'text-success hover:bg-success/10'
                      : 'text-muted hover:bg-card-hover'
                  }`}
                  title={rule.isActive ? 'Disable rule' : 'Enable rule'}
                >
                  {rule.isActive ? <Zap className="h-4 w-4" /> : <ZapOff className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => onEdit(rule)}
                  className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-card-hover transition-colors opacity-0 group-hover:opacity-100"
                  title="Edit rule"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onDelete(rule.id)}
                  className="rounded-md p-1.5 text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete rule"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
