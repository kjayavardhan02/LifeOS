import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { CaptureInput } from './capture-input';

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickCaptureModal({ isOpen, onClose }: QuickCaptureModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/50 animate-overlay-in"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-start justify-center pt-[15vh] px-6 pointer-events-none">
        <div className="relative w-full max-w-lg rounded-lg border border-border bg-card shadow-2xl animate-dialog-in pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground">Quick Capture</h2>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5">
            <CaptureInput onSuccess={onClose} autoFocus />
          </div>

          {/* Footer hint */}
          <div className="border-t border-border px-5 py-2.5">
            <p className="text-xs text-muted">
              Press <kbd className="rounded border border-border bg-card-hover px-1 py-0.5 text-muted-foreground">Enter</kbd> to capture
              {' '} or <kbd className="rounded border border-border bg-card-hover px-1 py-0.5 text-muted-foreground">Esc</kbd> to close
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
