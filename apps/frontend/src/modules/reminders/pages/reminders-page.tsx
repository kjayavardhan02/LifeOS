import { useState } from 'react';
import { Plus, Bell } from 'lucide-react';
import {
  useReminders,
  useCreateReminder,
  useUpdateReminder,
  useSnoozeReminder,
  useDismissReminder,
  useMarkReminderDone,
} from '../hooks/use-reminders';
import { ReminderFilters } from '../components/reminder-filters';
import { ReminderItem } from '../components/reminder-item';
import { ReminderDialog } from '../components/reminder-dialog';
import { ReminderDetailPanel } from '../components/reminder-detail-panel';
import type { Reminder, ReminderFilters as ReminderFiltersType, CreateReminderInput, UpdateReminderInput } from '@lifeos/shared';

export function RemindersPage() {
  const [filters, setFilters] = useState<ReminderFiltersType>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useReminders({ ...filters, page, limit: 50 });
  const createReminder = useCreateReminder();
  const updateReminder = useUpdateReminder();
  const snoozeReminder = useSnoozeReminder();
  const dismissReminder = useDismissReminder();
  const markDone = useMarkReminderDone();


  const reminders = data?.data ?? [];
  const meta = data?.meta;

  const handleSubmit = (input: CreateReminderInput | (UpdateReminderInput & { id: string })) => {
    if ('id' in input) {
      updateReminder.mutate(input, { onSuccess: () => { setDialogOpen(false); setEditingReminder(null); } });
    } else {
      createReminder.mutate(input, { onSuccess: () => setDialogOpen(false) });
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Reminders</h1>
          <p className="mt-1 text-sm text-muted-foreground">{meta?.total ?? 0} reminders total</p>
        </div>
        <button
          onClick={() => { setEditingReminder(null); setDialogOpen(true); }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B9BF0] to-[#3D6FBF] px-5 py-2 text-sm font-medium text-white shadow-[0_2px_12px_rgba(91,155,240,0.3)] hover:shadow-[0_4px_20px_rgba(91,155,240,0.4)] transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Reminder
        </button>
      </div>

      <div className="mb-4">
        <ReminderFilters filters={filters} onChange={setFilters} />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : reminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <Bell className="h-10 w-10 text-muted" />
          <p className="mt-3 text-sm text-muted-foreground">No reminders found</p>
          <p className="mt-1 text-xs text-muted">Create your first reminder to get started</p>
          <button
            onClick={() => { setEditingReminder(null); setDialogOpen(true); }}
            className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B9BF0] to-[#3D6FBF] px-5 py-2 text-sm font-medium text-white shadow-[0_2px_12px_rgba(91,155,240,0.3)] hover:shadow-[0_4px_20px_rgba(91,155,240,0.4)] transition-all"
          >
            <Plus className="h-4 w-4" />
            Create Reminder
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {reminders.map((reminder, i) => (
              <div key={reminder.id} className="animate-card-in" style={{ '--i': i } as React.CSSProperties}>
                <ReminderItem
                  reminder={reminder}
                  onDone={(id) => markDone.mutate(id)}
                  onDismiss={(id) => dismissReminder.mutate(id)}
                  onSnooze={(id, minutes) => snoozeReminder.mutate({ id, minutes })}
                  onClick={setSelectedReminder}
                />
              </div>
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <ReminderDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingReminder(null); }}
        onSubmit={handleSubmit}
        reminder={editingReminder}
      />

      <ReminderDetailPanel
        reminder={selectedReminder}
        onClose={() => setSelectedReminder(null)}
      />
    </div>
  );
}
