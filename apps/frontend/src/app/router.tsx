import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import { DashboardPage } from '@/modules/dashboard/pages/dashboard-page';

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Coming soon</p>
      <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-sm text-muted">This module is not yet implemented</p>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/tasks', element: <PlaceholderPage title="Task Management" /> },
      { path: '/calendar', element: <PlaceholderPage title="Calendar & Events" /> },
      { path: '/reminders', element: <PlaceholderPage title="Reminders" /> },
      { path: '/finance', element: <PlaceholderPage title="Finance Management" /> },
      { path: '/subscriptions', element: <PlaceholderPage title="Subscription Manager" /> },
      { path: '/projects', element: <PlaceholderPage title="Project Management" /> },
      { path: '/knowledge', element: <PlaceholderPage title="Knowledge Base" /> },
      { path: '/documents', element: <PlaceholderPage title="Document Vault" /> },
      { path: '/capture', element: <PlaceholderPage title="Quick Capture" /> },
      { path: '/settings', element: <PlaceholderPage title="Settings" /> },
    ],
  },
]);
