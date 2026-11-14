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
  Workflow,
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
      { label: 'Automation', path: '/automation', icon: Workflow },
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
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border/50 bg-sidebar transition-all duration-200',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="relative flex h-16 items-center gap-3 border-b border-border/50 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#5B9BF0]/5 to-transparent pointer-events-none" />
        <img src="/logo1.png" alt="AVENLO" className="relative h-9 w-9 shrink-0 rounded-xl object-contain ring-1 ring-white/10 shadow-lg shadow-primary/10" />
        {!collapsed && (
          <div className="relative">
            <span className="text-base font-bold text-foreground tracking-tight">AVENLO</span>
            <span className="ml-2 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">beta</span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navigation.map((group) => (
          <div key={group.label} className="mb-5">
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
                        'group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-150',
                        isActive
                          ? 'bg-[#5B9BF0]/10 text-[#5B9BF0] shadow-[inset_0_1px_0_rgba(91,155,240,0.1)]'
                          : 'text-muted-foreground hover:bg-card-hover hover:text-foreground',
                        collapsed && 'justify-center px-0',
                      )
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-gradient-to-b from-[#5B9BF0] to-[#7BB3FF] shadow-[0_0_8px_rgba(91,155,240,0.5)]" />
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

      <div className="border-t border-border/50 p-3 space-y-0.5">
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl p-2 text-muted-foreground transition-all hover:bg-[#E05A52]/10 hover:text-[#E05A52]',
            collapsed && 'justify-center',
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
        <button
          onClick={toggle}
          className="flex w-full items-center justify-center rounded-xl p-2 text-muted-foreground transition-colors hover:bg-card-hover hover:text-foreground"
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
