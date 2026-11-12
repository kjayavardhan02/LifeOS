import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Bell,
  Wallet,
  CreditCard,
  FolderKanban,
  Target,
  BarChart3,
  BookOpen,
  BookMarked,
  FileBox,
  Zap,
  Settings,
  PanelLeftClose,
  PanelLeft,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebar-store';
import { useAuthStore } from '@/stores/auth-store';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    label: 'Productivity',
    items: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard },
      { label: 'Tasks', path: '/tasks', icon: CheckSquare },
      { label: 'Calendar', path: '/calendar', icon: Calendar },
      { label: 'Reminders', path: '/reminders', icon: Bell },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Finance', path: '/finance', icon: Wallet },
      { label: 'Subscriptions', path: '/subscriptions', icon: CreditCard },
    ],
  },
  {
    label: 'Projects',
    items: [{ label: 'Projects', path: '/projects', icon: FolderKanban }],
  },
  {
    label: 'Growth',
    items: [
      { label: 'Goals & Habits', path: '/goals', icon: Target },
      { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Knowledge',
    items: [
      { label: 'Reading', path: '/reading', icon: BookMarked },
      { label: 'Knowledge Base', path: '/knowledge', icon: BookOpen },
      { label: 'Documents', path: '/documents', icon: FileBox },
    ],
  },
  {
    label: 'Tools',
    items: [
      { label: 'Quick Capture', path: '/capture', icon: Zap },
      { label: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const { collapsed, toggle } = useSidebarStore();
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-200',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="flex h-14 items-center gap-3 border-b border-border px-4">
        <img src="/Logo.png" alt="AVENLO" className="h-8 w-8 shrink-0 rounded-lg object-contain" />
        {!collapsed && (
          <span className="text-base font-semibold text-foreground tracking-tight">AVENLO</span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navigation.map((group) => (
          <div key={group.label} className="mb-6">
            {!collapsed && (
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted animate-sidebar-label">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150',
                        isActive
                          ? 'bg-[#5B9BF0]/10 text-[#5B9BF0]'
                          : 'text-muted-foreground hover:bg-card-hover hover:text-foreground',
                        collapsed && 'justify-center px-0',
                      )
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-[#5B9BF0] shadow-[0_0_8px_rgba(91,155,240,0.5)]" />
                        )}
                        <item.icon className={cn(
                          'h-[18px] w-[18px] shrink-0 transition-colors',
                          isActive ? 'text-[#5B9BF0]' : 'text-muted group-hover:text-foreground',
                        )} />
                        {!collapsed && <span>{item.label}</span>}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3 space-y-0.5">
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg p-2 text-muted-foreground transition-all hover:bg-[#E05A52]/10 hover:text-[#E05A52]',
            collapsed && 'justify-center',
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
        <button
          onClick={toggle}
          className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-card-hover hover:text-foreground"
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
