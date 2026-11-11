import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, CheckSquare, IndianRupee, StickyNote, Bell, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCapture, useParseCapture } from '../hooks/use-quick-capture';
import { CaptureTypeBadge } from './capture-type-badge';
import type { QuickCaptureType, QuickCaptureParseResult } from '@lifeos/shared';

const TYPE_BUTTONS: { type: QuickCaptureType; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { type: 'task', icon: CheckSquare, label: 'Task' },
  { type: 'expense', icon: IndianRupee, label: 'Expense' },
  { type: 'note', icon: StickyNote, label: 'Note' },
  { type: 'reminder', icon: Bell, label: 'Reminder' },
  { type: 'event', icon: Calendar, label: 'Event' },
];

interface CaptureInputProps {
  onSuccess?: () => void;
  autoFocus?: boolean;
}

export function CaptureInput({ onSuccess, autoFocus = true }: CaptureInputProps) {
  const [input, setInput] = useState('');
  const [overrideType, setOverrideType] = useState<QuickCaptureType | undefined>();
  const [parseResult, setParseResult] = useState<QuickCaptureParseResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const capture = useCapture();
  const parse = useParseCapture();

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Debounced parse as user types
  const debouncedParse = useCallback(
    (value: string, typeOverride?: QuickCaptureType) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!value.trim()) {
        setParseResult(null);
        return;
      }
      debounceRef.current = setTimeout(() => {
        parse.mutate(
          { input: value, type: typeOverride },
          { onSuccess: (res) => setParseResult(res.data) },
        );
      }, 300);
    },
    [parse],
  );

  const handleInputChange = (value: string) => {
    setInput(value);
    debouncedParse(value, overrideType);
  };

  const handleTypeOverride = (type: QuickCaptureType) => {
    const newType = overrideType === type ? undefined : type;
    setOverrideType(newType);
    if (input.trim()) {
      debouncedParse(input, newType);
    }
  };

  const handleSubmit = () => {
    if (!input.trim() || capture.isPending) return;
    capture.mutate(
      { input: input.trim(), type: overrideType },
      {
        onSuccess: () => {
          setInput('');
          setOverrideType(undefined);
          setParseResult(null);
          onSuccess?.();
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-3">
      {/* Input field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type anything... (e.g., '300 food zomato' or 'call mom tomorrow 5pm')"
          className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-12 text-lg text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || capture.isPending}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:text-primary disabled:opacity-40 transition-colors"
          title="Capture (Enter)"
        >
          {capture.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Type override buttons */}
      <div className="flex flex-wrap gap-2">
        {TYPE_BUTTONS.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => handleTypeOverride(type)}
            className={cn(
              'flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors',
              overrideType === type
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-border-hover hover:text-foreground',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Parse preview */}
      {parseResult && input.trim() && (
        <div className="rounded-lg border border-border bg-card-hover p-4 space-y-2 animate-card-in">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted uppercase tracking-wider font-medium">Detected as</span>
            <CaptureTypeBadge type={parseResult.type} />
            <span className="text-xs text-muted">
              ({Math.round(parseResult.confidence * 100)}% confidence)
            </span>
          </div>
          <p className="text-sm text-foreground">{parseResult.preview}</p>

          {/* Show parsed fields */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {Object.entries(parseResult.parsed).map(([key, value]) => {
              if (value === null || value === undefined || value === '') return null;
              let displayValue: string;
              if (typeof value === 'object') {
                displayValue = JSON.stringify(value);
              } else {
                displayValue = String(value);
              }
              // Truncate long datetime strings
              if (key.toLowerCase().includes('date') && typeof value === 'string') {
                try {
                  displayValue = new Date(value).toLocaleString();
                } catch {
                  // keep original
                }
              }
              return (
                <span key={key}>
                  <span className="text-muted">{key}:</span> {displayValue}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
