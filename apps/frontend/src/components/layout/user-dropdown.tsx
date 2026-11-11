import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { getAvatarUrl } from '@/lib/avatar';
import { cn } from '@/lib/utils';

export function UserDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const avatarUrl = getAvatarUrl(user?.id || 'default', 40);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleNav(path: string) {
    setOpen(false);
    navigate(path);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden transition-opacity hover:opacity-80"
        title={user?.name}
      >
        <img src={avatarUrl} alt={user?.name || 'Avatar'} className="h-full w-full object-cover" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-card shadow-xl shadow-black/20 animate-dialog-in origin-top-right">
          {/* User info header */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <img
              src={getAvatarUrl(user?.id || 'default', 80)}
              alt={user?.name || 'Avatar'}
              className="h-10 w-10 shrink-0 rounded-full"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-1.5">
            <button
              onClick={() => handleNav('/profile')}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground',
                'transition-colors hover:bg-card-hover hover:text-foreground',
              )}
            >
              <User className="h-4 w-4" />
              View Profile
            </button>
            <button
              onClick={() => handleNav('/settings')}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground',
                'transition-colors hover:bg-card-hover hover:text-foreground',
              )}
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>

          <div className="border-t border-border p-1.5">
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-danger',
                'transition-colors hover:bg-card-hover',
              )}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
