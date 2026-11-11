import { useState, useEffect, useCallback } from 'react';
import { Zap } from 'lucide-react';
import { QuickCaptureModal } from './quick-capture-modal';

export function QuickCaptureButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  // Global keyboard shortcut: Ctrl+Shift+Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.code === 'Space') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary-hover transition-colors"
        title="Quick Capture (Ctrl+Shift+Space)"
      >
        <Zap className="h-5 w-5" />
      </button>

      <QuickCaptureModal isOpen={isOpen} onClose={handleClose} />
    </>
  );
}
