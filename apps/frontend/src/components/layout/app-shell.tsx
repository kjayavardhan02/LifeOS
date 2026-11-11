import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from './sidebar';
import { TopBar } from './topbar';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebar-store';
import { QuickCaptureButton } from '@/modules/quick-capture';

export function AppShell() {
  const collapsed = useSidebarStore((s) => s.collapsed);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={cn('transition-all duration-200', collapsed ? 'ml-16' : 'ml-64')}>
        <TopBar />
        <main className="p-6">
          <div className="animate-page-in">
            <Outlet />
          </div>
        </main>
      </div>
      <QuickCaptureButton />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-foreground)',
          },
          success: {
            style: {
              background: '#22A06B',
              color: '#ffffff',
              border: '1px solid #22A06B',
            },
          },
          error: {
            style: {
              background: '#C04741',
              color: '#ffffff',
              border: '1px solid #C04741',
            },
          },
        }}
      />
    </div>
  );
}
