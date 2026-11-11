import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CreateHabitInput, UpdateHabitInput, HabitFrequency } from '@lifeos/shared';

interface HabitDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateHabitInput | (UpdateHabitInput & { id: string })) => void;
  initialData?: {
    id: string;
    name: string;
    description: string | null;
    frequency: HabitFrequency;
    targetDays: string[];
    targetCount: number;
    unit: string | null;
    category: string;
    color: string;
  };
}

const frequencies: { value: HabitFrequency; label: string }[] = [
  { value: 'daily', label: 'Every Day' },
  { value: 'specific_days', label: 'Specific Days' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const dayOptions = [
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
  { value: 'sun', label: 'Sun' },
];

const categories = ['Personal', 'Health', 'Productivity', 'Learning', 'Finance', 'Mindfulness', 'Social', 'Other'];

const colorOptions = ['#4E85DE', '#22A06B', '#F4B942', '#C04741', '#DE8863', '#9B59B6', '#1ABC9C', '#E74C3C'];

export function HabitDialog({ open, onClose, onSubmit, initialData }: HabitDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [targetDays, setTargetDays] = useState<string[]>([]);
  const [targetCount, setTargetCount] = useState(1);
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('Personal');
  const [color, setColor] = useState('#4E85DE');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description ?? '');
      setFrequency(initialData.frequency);
      setTargetDays(initialData.targetDays);
      setTargetCount(initialData.targetCount);
      setUnit(initialData.unit ?? '');
      setCategory(initialData.category);
      setColor(initialData.color);
    } else {
      setName('');
      setDescription('');
      setFrequency('daily');
      setTargetDays([]);
      setTargetCount(1);
      setUnit('');
      setCategory('Personal');
      setColor('#4E85DE');
    }
  }, [initialData, open]);

  if (!open) return null;

  const toggleDay = (day: string) => {
    setTargetDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = {
      name,
      description: description || undefined,
      frequency,
      targetDays: frequency === 'specific_days' ? targetDays : undefined,
      targetCount,
      unit: unit || undefined,
      category,
      color,
    };

    if (initialData) {
      onSubmit({ ...input, id: initialData.id });
    } else {
      onSubmit(input);
    }
  };

  const selectClass = 'h-9 w-full rounded-md border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none';
  const inputClass = 'h-9 w-full rounded-md border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 animate-overlay-in" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-hidden rounded-lg border border-border bg-card shadow-xl flex flex-col animate-dialog-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {initialData ? 'Edit Habit' : 'New Habit'}
          </h2>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="e.g., Exercise, Read, Meditate"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
              rows={2}
              placeholder="Optional details..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Frequency</label>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value as HabitFrequency)} className={selectClass}>
              {frequencies.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {frequency === 'specific_days' && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">Days</label>
              <div className="flex gap-1.5">
                {dayOptions.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDay(d.value)}
                    className={cn(
                      'flex h-8 w-10 items-center justify-center rounded-md text-xs font-medium transition-colors',
                      targetDays.includes(d.value)
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Target Count</label>
              <input
                type="number"
                min={1}
                max={100}
                value={targetCount}
                onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Unit (optional)</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className={inputClass}
                placeholder="e.g., glasses, pages, km"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Color</label>
            <div className="flex gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'h-7 w-7 rounded-full transition-all',
                    color === c ? 'ring-2 ring-foreground ring-offset-2 ring-offset-card' : 'hover:scale-110',
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {initialData ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
