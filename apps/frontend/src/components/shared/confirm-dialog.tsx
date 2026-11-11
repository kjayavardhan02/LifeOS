import { createPortal } from 'react-dom';
import { AlertTriangle, Unlink, Trash2, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type ConfirmVariant = 'danger' | 'warning' | 'default';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  icon?: LucideIcon;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantStyles: Record<ConfirmVariant, { icon: LucideIcon; btnClass: string; iconClass: string; iconBg: string }> = {
  danger: {
    icon: Trash2,
    btnClass: 'bg-danger text-white hover:bg-danger/90',
    iconClass: 'text-danger',
    iconBg: 'bg-danger/10',
  },
  warning: {
    icon: AlertTriangle,
    btnClass: 'bg-warning text-background hover:bg-warning/90',
    iconClass: 'text-warning',
    iconBg: 'bg-warning/10',
  },
  default: {
    icon: Unlink,
    btnClass: 'bg-primary text-primary-foreground hover:bg-primary-hover',
    iconClass: 'text-primary',
    iconBg: 'bg-primary/10',
  },
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  icon,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const styles = variantStyles[variant];
  const Icon = icon ?? styles.icon;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 animate-overlay-in" onClick={onCancel} />
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full max-w-sm rounded-lg border border-border bg-card shadow-2xl pointer-events-auto animate-dialog-in">
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', styles.iconBg)}>
                <Icon className={cn('h-5 w-5', styles.iconClass)} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
            <button
              onClick={onCancel}
              className="rounded-md border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={cn('rounded-md px-4 py-1.5 text-sm font-medium transition-colors', styles.btnClass)}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
