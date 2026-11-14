import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2 } from 'lucide-react';
import type { AutomationRule } from '../hooks/use-automation';

const EVENT_OPTIONS = [
  { value: 'task.created', label: 'Task Created' },
  { value: 'task.completed', label: 'Task Completed' },
  { value: 'task.updated', label: 'Task Updated' },
  { value: 'task.deleted', label: 'Task Deleted' },
  { value: 'subscription.created', label: 'Subscription Created' },
  { value: 'subscription.renewed', label: 'Subscription Renewed' },
  { value: 'subscription.cancelled', label: 'Subscription Cancelled' },
  { value: 'document.created', label: 'Document Created' },
  { value: 'document.updated', label: 'Document Updated' },
  { value: 'reminder.due', label: 'Reminder Due' },
  { value: 'transaction.created', label: 'Transaction Created' },
  { value: 'habit.logged', label: 'Habit Logged' },
  { value: 'goal.completed', label: 'Goal Completed' },
];

const SCHEDULE_PRESETS = [
  { value: '0 9 * * *', label: 'Daily at 9 AM' },
  { value: '0 9 * * 1', label: 'Weekly on Monday at 9 AM' },
  { value: '0 9 1 * *', label: 'Monthly on 1st at 9 AM' },
  { value: '0 18 * * 5', label: 'Friday at 6 PM' },
  { value: '0 0 * * *', label: 'Daily at midnight' },
];

const ACTION_TYPES = [
  { value: 'create_task', label: 'Create Task' },
  { value: 'create_reminder', label: 'Create Reminder' },
  { value: 'create_transaction', label: 'Create Transaction' },
  { value: 'send_notification', label: 'Send Email' },
];

const OPERATORS = [
  { value: 'eq', label: '=' },
  { value: 'neq', label: '≠' },
  { value: 'gt', label: '>' },
  { value: 'lt', label: '<' },
  { value: 'contains', label: 'contains' },
];

interface ActionConfig {
  actionType: string;
  config: Record<string, string>;
}

interface Condition {
  field: string;
  op: string;
  value: string;
}

interface RuleDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
  rule?: AutomationRule | null;
}

export function RuleDialog({ open, onClose, onSubmit, rule }: RuleDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState<'event' | 'schedule' | 'threshold'>('event');
  const [eventName, setEventName] = useState('task.completed');
  const [cronExpression, setCronExpression] = useState('0 9 * * *');
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [actions, setActions] = useState<ActionConfig[]>([
    { actionType: 'create_reminder', config: { title: '', dueDate: '+1d' } },
  ]);

  useEffect(() => {
    if (rule) {
      setName(rule.name);
      setDescription(rule.description ?? '');
      setTriggerType(rule.triggerType);
      const tc = rule.triggerConfig as Record<string, string>;
      if (rule.triggerType === 'event') setEventName(tc['eventName'] ?? 'task.completed');
      if (rule.triggerType === 'schedule') setCronExpression(tc['cron'] ?? '0 9 * * *');
      setConditions((rule.conditions ?? []) as Condition[]);
      setActions(rule.actions.map((a) => ({
        actionType: a.actionType,
        config: a.config as Record<string, string>,
      })));
    } else {
      setName('');
      setDescription('');
      setTriggerType('event');
      setEventName('task.completed');
      setCronExpression('0 9 * * *');
      setConditions([]);
      setActions([{ actionType: 'create_reminder', config: { title: '', dueDate: '+1d' } }]);
    }
  }, [rule, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || actions.length === 0) return;

    const triggerConfig = triggerType === 'event'
      ? { eventName }
      : triggerType === 'schedule'
        ? { cron: cronExpression }
        : {};

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      triggerType,
      triggerConfig,
      conditions: conditions.length > 0 ? conditions : undefined,
      actions: actions.map((a, i) => ({
        actionType: a.actionType,
        config: a.config,
        sortOrder: i,
      })),
    });
  };

  const addCondition = () => setConditions([...conditions, { field: '', op: 'eq', value: '' }]);
  const removeCondition = (i: number) => setConditions(conditions.filter((_, j) => j !== i));
  const updateCondition = (i: number, key: keyof Condition, val: string) => {
    const updated = [...conditions];
    updated[i] = { ...updated[i]!, [key]: val };
    setConditions(updated);
  };

  const addAction = () => setActions([...actions, { actionType: 'create_task', config: { title: '' } }]);
  const removeAction = (i: number) => setActions(actions.filter((_, j) => j !== i));
  const updateActionType = (i: number, type: string) => {
    const updated = [...actions];
    updated[i] = { actionType: type, config: { title: '' } };
    setActions(updated);
  };
  const updateActionConfig = (i: number, key: string, val: string) => {
    const updated = [...actions];
    updated[i] = { ...updated[i]!, config: { ...updated[i]!.config, [key]: val } };
    setActions(updated);
  };

  const inputClass = 'w-full rounded-md border border-border bg-input px-3 py-1.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary';
  const labelClass = 'block text-xs font-medium text-muted-foreground mb-1';

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 animate-overlay-in" onClick={onClose} />
      <div className="absolute inset-0 overflow-hidden flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full max-w-2xl rounded-lg border border-border bg-card shadow-2xl flex flex-col overflow-hidden animate-dialog-in pointer-events-auto" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
          <div className="shrink-0 flex items-center justify-between border-b border-border bg-card px-4 py-2.5 rounded-t-lg">
            <h2 className="text-base font-semibold text-foreground">
              {rule ? 'Edit Automation Rule' : 'New Automation Rule'}
            </h2>
            <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="px-4 py-3 space-y-3 overflow-y-auto flex-1 min-h-0 overscroll-contain">
              <div>
                <label className={labelClass}>Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Follow up on completed tasks" className={inputClass} autoFocus required />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this rule do?" className={inputClass} />
              </div>

              {/* Trigger */}
              <div className="rounded-lg border border-border p-3 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trigger</p>
                <div className="grid grid-cols-3 gap-1 rounded-lg border border-border p-1">
                  {(['event', 'schedule', 'threshold'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTriggerType(t)}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        triggerType === t ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>

                {triggerType === 'event' && (
                  <div>
                    <label className={labelClass}>When this event occurs</label>
                    <select value={eventName} onChange={(e) => setEventName(e.target.value)} className={inputClass}>
                      {EVENT_OPTIONS.map((ev) => (
                        <option key={ev.value} value={ev.value}>{ev.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {triggerType === 'schedule' && (
                  <div>
                    <label className={labelClass}>Schedule</label>
                    <select value={cronExpression} onChange={(e) => setCronExpression(e.target.value)} className={inputClass}>
                      {SCHEDULE_PRESETS.map((sp) => (
                        <option key={sp.value} value={sp.value}>{sp.label}</option>
                      ))}
                    </select>
                    <div className="mt-1">
                      <label className={labelClass}>Or enter cron expression</label>
                      <input type="text" value={cronExpression} onChange={(e) => setCronExpression(e.target.value)} placeholder="* * * * *" className={inputClass} />
                    </div>
                  </div>
                )}

                {triggerType === 'threshold' && (
                  <p className="text-xs text-muted-foreground">Threshold triggers are evaluated daily. Configure conditions below.</p>
                )}
              </div>

              {/* Conditions */}
              <div className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Conditions (optional)</p>
                  <button type="button" onClick={addCondition} className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors">
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
                {conditions.map((cond, i) => (
                  <div key={i} className="grid grid-cols-[1fr_80px_1fr_28px] gap-2 items-end">
                    <input type="text" value={cond.field} onChange={(e) => updateCondition(i, 'field', e.target.value)} placeholder="e.g. priority" className={inputClass} />
                    <select value={cond.op} onChange={(e) => updateCondition(i, 'op', e.target.value)} className={inputClass}>
                      {OPERATORS.map((op) => (
                        <option key={op.value} value={op.value}>{op.label}</option>
                      ))}
                    </select>
                    <input type="text" value={cond.value} onChange={(e) => updateCondition(i, 'value', e.target.value)} placeholder="value" className={inputClass} />
                    <button type="button" onClick={() => removeCondition(i)} className="p-1 text-muted hover:text-danger transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {conditions.length === 0 && (
                  <p className="text-xs text-muted">No conditions — rule triggers on every matching event.</p>
                )}
              </div>

              {/* Actions */}
              <div className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions *</p>
                  <button type="button" onClick={addAction} className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors">
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
                {actions.map((action, i) => (
                  <div key={i} className="rounded-md border border-border/50 p-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <select value={action.actionType} onChange={(e) => updateActionType(i, e.target.value)} className={inputClass + ' flex-1'}>
                        {ACTION_TYPES.map((at) => (
                          <option key={at.value} value={at.value}>{at.label}</option>
                        ))}
                      </select>
                      {actions.length > 1 && (
                        <button type="button" onClick={() => removeAction(i)} className="p-1 text-muted hover:text-danger transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {(action.actionType === 'create_task' || action.actionType === 'create_reminder') && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className={labelClass}>Title</label>
                          <input type="text" value={action.config['title'] ?? ''} onChange={(e) => updateActionConfig(i, 'title', e.target.value)} placeholder="Use {{title}} for event data" className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Due Date</label>
                          <input type="text" value={action.config['dueDate'] ?? ''} onChange={(e) => updateActionConfig(i, 'dueDate', e.target.value)} placeholder="+1d, +7d, +1h" className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Priority</label>
                          <select value={action.config['priority'] ?? 'medium'} onChange={(e) => updateActionConfig(i, 'priority', e.target.value)} className={inputClass}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Category</label>
                          <input type="text" value={action.config['category'] ?? ''} onChange={(e) => updateActionConfig(i, 'category', e.target.value)} placeholder="Optional" className={inputClass} />
                        </div>
                      </div>
                    )}

                    {action.actionType === 'create_transaction' && (
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className={labelClass}>Amount</label>
                          <input type="text" value={action.config['amount'] ?? ''} onChange={(e) => updateActionConfig(i, 'amount', e.target.value)} placeholder="0.00" className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Type</label>
                          <select value={action.config['type'] ?? 'expense'} onChange={(e) => updateActionConfig(i, 'type', e.target.value)} className={inputClass}>
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Category</label>
                          <input type="text" value={action.config['category'] ?? ''} onChange={(e) => updateActionConfig(i, 'category', e.target.value)} placeholder="Category" className={inputClass} />
                        </div>
                      </div>
                    )}

                    {action.actionType === 'send_notification' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className={labelClass}>Subject</label>
                          <input type="text" value={action.config['subject'] ?? ''} onChange={(e) => updateActionConfig(i, 'subject', e.target.value)} placeholder="Email subject" className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Body</label>
                          <input type="text" value={action.config['body'] ?? ''} onChange={(e) => updateActionConfig(i, 'body', e.target.value)} placeholder="Email body (supports {{templates}})" className={inputClass} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-xs text-muted-foreground bg-card-hover rounded-md p-2">
                <strong>Template variables:</strong> Use <code className="text-primary">{'{{title}}'}</code>, <code className="text-primary">{'{{taskId}}'}</code>, <code className="text-primary">{'{{amount}}'}</code>, etc. to reference trigger event data in action fields.
              </div>
            </div>

            <div className="shrink-0 flex justify-end gap-3 px-4 py-2.5 border-t border-border rounded-b-lg">
              <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={!name.trim() || actions.length === 0} className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition-colors">
                {rule ? 'Save Changes' : 'Create Rule'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
