import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import { AuthGuard, GuestGuard, AuthLayout, LoginPage, SignupPage } from '@/modules/auth';
import { DashboardPage } from '@/modules/dashboard/pages/dashboard-page';
import { TasksPage } from '@/modules/tasks';
import { CalendarPage } from '@/modules/calendar';
import { RemindersPage } from '@/modules/reminders';
import { ProfilePage } from '@/modules/profile/pages/profile-page';
import { SettingsPage } from '@/modules/settings/pages/settings-page';
import { SubscriptionsPage } from '@/modules/subscriptions';
import { FinancePage } from '@/modules/finance';
import { ProjectsPage, ProjectDetailPage } from '@/modules/projects';
import { KnowledgePage } from '@/modules/knowledge';
import { DocumentsPage } from '@/modules/documents';
import { QuickCapturePage } from '@/modules/quick-capture';

export const router = createBrowserRouter([
  {
    element: <GuestGuard />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/signup', element: <SignupPage /> },
        ],
      },
    ],
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/tasks', element: <TasksPage /> },
          { path: '/calendar', element: <CalendarPage /> },
          { path: '/reminders', element: <RemindersPage /> },
          { path: '/finance', element: <FinancePage /> },
          { path: '/subscriptions', element: <SubscriptionsPage /> },
          { path: '/projects', element: <ProjectsPage /> },
          { path: '/projects/:id', element: <ProjectDetailPage /> },
          { path: '/knowledge', element: <KnowledgePage /> },
          { path: '/documents', element: <DocumentsPage /> },
          { path: '/capture', element: <QuickCapturePage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
]);
