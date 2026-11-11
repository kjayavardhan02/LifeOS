import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

export function AuthLayout() {
  return (
    <>
      <Outlet />
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
    </>
  );
}
