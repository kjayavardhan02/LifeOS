import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  LogIn,
  CheckSquare,
  Wallet,
  Calendar,
  BookOpen,
  Zap,
  Shield,
} from 'lucide-react';
import { useLogin } from '../hooks/use-auth';

const features = [
  { icon: CheckSquare, label: 'Tasks & Projects' },
  { icon: Wallet, label: 'Finance Tracking' },
  { icon: Calendar, label: 'Calendar & Events' },
  { icon: BookOpen, label: 'Knowledge Base' },
  { icon: Zap, label: 'Quick Capture' },
  { icon: Shield, label: 'Private & Secure' },
];

export function LoginPage() {
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login.mutate({ email, password });
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel — branding */}
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-between">
        {/* Gradient mesh background */}
        <div className="absolute inset-0">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-[128px]" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-info/15 blur-[100px]" />
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-success/10 blur-[80px]" />
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center px-16">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25">
              L
            </div>
            <span className="text-2xl font-bold text-foreground">LifeOS</span>
          </div>
          <p className="mb-10 max-w-md text-lg text-muted-foreground">
            Your centralized personal management platform. Everything you need, in one place.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, label }, i) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-card/50 px-3.5 py-2.5 backdrop-blur-sm animate-card-in"
                style={{ '--i': i } as React.CSSProperties}
              >
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 px-16 pb-8 text-xs text-muted/60">
          Localhost-first. Your data stays on your machine.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm animate-page-in">
          {/* Mobile-only logo */}
          <div className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground">
              L
            </div>
            <span className="text-xl font-bold text-foreground">LifeOS</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to continue to your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-input px-3 pr-10 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={login.isPending}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-md hover:shadow-primary/30 disabled:opacity-50 disabled:shadow-none"
            >
              {login.isPending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              Sign in
            </button>
          </form>

          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="font-medium text-primary transition-colors hover:text-primary-hover"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
