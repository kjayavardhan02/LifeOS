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
        <main className="p-6 max-w-[1600px]">
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
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            style: {
              background: '#151514',
              color: '#2BD47D',
              border: '1px solid rgba(43, 212, 125, 0.2)',
            },
          },
          error: {
            style: {
              background: '#151514',
              color: '#E05A52',
              border: '1px solid rgba(224, 90, 82, 0.2)',
            },
          },
        }}
      />
    </div>
  );
}
