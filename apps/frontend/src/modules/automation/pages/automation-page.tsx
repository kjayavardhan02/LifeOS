import { useState } from 'react';
import { Plus, Zap, History } from 'lucide-react';
import {
  useAutomationRules,
  useAutomationLogs,
  useCreateRule,
  useUpdateRule,
  useDeleteRule,
  useToggleRule,
  type AutomationRule,
} from '../hooks/use-automation';
import { RuleList } from '../components/rule-list';
import { RuleDialog } from '../components/rule-dialog';
import { AutomationLogs } from '../components/automation-logs';

export function AutomationPage() {
  const [tab, setTab] = useState<'rules' | 'logs'>('rules');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

  const { data: rulesData, isLoading: rulesLoading } = useAutomationRules();
  const { data: logsData, isLoading: logsLoading } = useAutomationLogs();
  const createRule = useCreateRule();
  const updateRule = useUpdateRule();
  const deleteRule = useDeleteRule();
  const toggleRule = useToggleRule();

  const rules = (rulesData as { data: AutomationRule[] } | undefined)?.data ?? [];
  const logs = (logsData as { data: Array<Record<string, unknown>> } | undefined)?.data ?? [];

  const handleCreate = () => {
    setEditingRule(null);
    setDialogOpen(true);
  };

  const handleEdit = (rule: AutomationRule) => {
    setEditingRule(rule);
    setDialogOpen(true);
  };

  const handleSubmit = (data: Record<string, unknown>) => {
    if (editingRule) {
      updateRule.mutate({ id: editingRule.id, ...data } as Parameters<typeof updateRule.mutate>[0]);
    } else {
      createRule.mutate(data as Parameters<typeof createRule.mutate>[0]);
    }
    setDialogOpen(false);
    setEditingRule(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this automation rule?')) {
      deleteRule.mutate(id);
    }
  };

  const activeCount = rules.filter((r) => r.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Automation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create rules to automate cross-module workflows
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
        >
          <Plus className="h-4 w-4" /> New Rule
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Rules</p>
          <p className="text-2xl font-bold text-foreground mt-1">{rules.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-success mt-1">{activeCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Executions</p>
          <p className="text-2xl font-bold text-primary mt-1">{logs.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        <button
          onClick={() => setTab('rules')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'rules'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Zap className="h-3.5 w-3.5" /> Rules
        </button>
        <button
          onClick={() => setTab('logs')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'logs'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <History className="h-3.5 w-3.5" /> Execution History
        </button>
      </div>

      {/* Content */}
      {tab === 'rules' && (
        rulesLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-lg border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : (
          <RuleList
            rules={rules}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggle={(id, isActive) => toggleRule.mutate({ id, isActive })}
          />
        )
      )}

      {tab === 'logs' && (
        logsLoading ? (
          <div className="h-40 rounded-lg border border-border bg-card animate-pulse" />
        ) : (
          <AutomationLogs logs={logs as Parameters<typeof AutomationLogs>[0]['logs']} />
        )
      )}

      <RuleDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingRule(null); }}
        onSubmit={handleSubmit}
        rule={editingRule}
      />
    </div>
  );
}
