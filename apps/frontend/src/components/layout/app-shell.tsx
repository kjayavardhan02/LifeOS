import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { TopBar } from './topbar';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebar-store';

export function AppShell() {
  const collapsed = useSidebarStore((s) => s.collapsed);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={cn('transition-all duration-200', collapsed ? 'ml-16' : 'ml-64')}>
        <TopBar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
