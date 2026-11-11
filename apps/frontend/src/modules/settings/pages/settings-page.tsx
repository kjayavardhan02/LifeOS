import { useState, useEffect } from 'react';
import {
  Save,
  Key,
  FolderOpen,
  Globe,
  CalendarClock,
  BellRing,
  IndianRupee,
  Plus,
  X,
  Tags,
} from 'lucide-react';
import { useSettings, useUpdateSettings } from '../hooks/use-settings';
import { useCategories, useCreateCategory, useDeleteCategory } from '@/hooks/use-categories';
import type { CategoryType } from '@lifeos/shared';

const CURRENCIES = [
  { value: 'INR', label: '₹ INR — Indian Rupee' },
  { value: 'USD', label: '$ USD — US Dollar' },
  { value: 'EUR', label: '€ EUR — Euro' },
  { value: 'GBP', label: '£ GBP — British Pound' },
];

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
];

const WEEK_STARTS = [
  { value: 'monday', label: 'Monday' },
  { value: 'sunday', label: 'Sunday' },
];

export function SettingsPage() {
  const { data, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const settings = data?.data;

  const [mcpServerKey, setMcpServerKey] = useState('');
  const [obsidianVault, setObsidianVault] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [weekStartsOn, setWeekStartsOn] = useState('monday');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(false);

  useEffect(() => {
    if (settings) {
      setMcpServerKey(settings.mcpServerKey || '');
      setObsidianVault(settings.obsidianVault || '');
      setCurrency(settings.currency);
      setDateFormat(settings.dateFormat);
      setWeekStartsOn(settings.weekStartsOn);
      setEmailNotifications(settings.emailNotifications);
      setBrowserNotifications(settings.browserNotifications);
    }
  }, [settings]);

  function handleSave() {
    updateSettings.mutate({
      mcpServerKey: mcpServerKey || null,
      obsidianVault: obsidianVault || null,
      currency,
      dateFormat,
      weekStartsOn,
      emailNotifications,
      browserNotifications,
    });
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Configure your LifeOS preferences</p>
      </div>

      <div className="space-y-6">
        {/* Integrations */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-5 text-base font-semibold text-foreground">🔗 Integrations</h2>

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                <Key className="h-4 w-4 text-primary" />
                MCP Server API Key
              </label>
              <input
                type="password"
                value={mcpServerKey}
                onChange={(e) => setMcpServerKey(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Enter your MCP server key"
              />
              <p className="mt-1 text-xs text-muted">Used to authenticate with the LifeOS MCP server for AI integrations</p>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                <FolderOpen className="h-4 w-4 text-success" />
                Obsidian Vault Path
              </label>
              <input
                type="text"
                value={obsidianVault}
                onChange={(e) => setObsidianVault(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="/home/user/Documents/MyVault"
              />
              <p className="mt-1 text-xs text-muted">Absolute path to your Obsidian vault for Knowledge Base indexing</p>
            </div>
          </div>
        </div>

        {/* Regional */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-5 text-base font-semibold text-foreground">🌍 Regional</h2>

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                <IndianRupee className="h-4 w-4 text-warning" />
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                <Globe className="h-4 w-4 text-info" />
                Date Format
              </label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {DATE_FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                <CalendarClock className="h-4 w-4 text-primary" />
                Week Starts On
              </label>
              <select
                value={weekStartsOn}
                onChange={(e) => setWeekStartsOn(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {WEEK_STARTS.map((w) => (
                  <option key={w.value} value={w.value}>{w.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-5 text-base font-semibold text-foreground">🔔 Notifications</h2>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellRing className="h-4 w-4 text-primary" />
                <div>
                  <span className="text-sm font-medium text-foreground">Email Notifications</span>
                  <p className="text-xs text-muted">Receive reminders and alerts via email</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                  emailNotifications ? 'bg-primary' : 'bg-border'
                }`}
              >
                <span
                  className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
                  style={{ transform: emailNotifications ? 'translateX(22px)' : 'translateX(2px)' }}
                />
              </button>
            </label>

            <label className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellRing className="h-4 w-4 text-info" />
                <div>
                  <span className="text-sm font-medium text-foreground">Browser Notifications</span>
                  <p className="text-xs text-muted">Push notifications in your browser</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBrowserNotifications(!browserNotifications)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                  browserNotifications ? 'bg-primary' : 'bg-border'
                }`}
              >
                <span
                  className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
                  style={{ transform: browserNotifications ? 'translateX(22px)' : 'translateX(2px)' }}
                />
              </button>
            </label>
          </div>
        </div>

        {/* Categories */}
        <CategoryManager />

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-md hover:shadow-primary/30 disabled:opacity-50"
        >
          {updateSettings.isPending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Settings
        </button>
      </div>
    </div>
  );
}

const CATEGORY_TABS: { type: CategoryType; label: string }[] = [
  { type: 'expense', label: 'Expense' },
  { type: 'income', label: 'Income' },
  { type: 'task', label: 'Task' },
  { type: 'event', label: 'Event' },
  { type: 'reminder', label: 'Reminder' },
  { type: 'subscription', label: 'Subscription' },
  { type: 'knowledge', label: 'Knowledge' },
  { type: 'document', label: 'Document' },
];

function CategoryManager() {
  const [activeTab, setActiveTab] = useState<CategoryType>('expense');
  const [newName, setNewName] = useState('');
  const { data, isLoading } = useCategories(activeTab);
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const categories = data?.data ?? [];

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    createCategory.mutate({ name: trimmed, type: activeTab }, {
      onSuccess: () => setNewName(''),
    });
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-5 text-base font-semibold text-foreground flex items-center gap-2">
        <Tags className="h-5 w-5 text-primary" />
        Categories
      </h2>

      <div className="flex flex-wrap gap-1 mb-4">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.type}
            onClick={() => { setActiveTab(tab.type); setNewName(''); }}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === tab.type
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-card-hover'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-1.5 mb-4 max-h-60 overflow-y-auto">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-md px-3 py-2 text-sm bg-background group hover:bg-card-hover transition-colors"
            >
              <span className="text-foreground">{cat.name}</span>
              <button
                onClick={() => deleteCategory.mutate(cat.id)}
                className="opacity-0 group-hover:opacity-100 rounded p-0.5 text-muted-foreground hover:text-danger transition-all"
                title="Delete category"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted">No categories yet</p>
          )}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={`New ${CATEGORY_TABS.find((t) => t.type === activeTab)?.label.toLowerCase()} category...`}
          className="h-9 flex-1 rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={!newName.trim() || createCategory.isPending}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </form>
    </div>
  );
}
