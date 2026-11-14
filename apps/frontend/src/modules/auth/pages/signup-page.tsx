import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  UserPlus,
  CheckSquare,
  Wallet,
  Calendar,
  BookOpen,
  Zap,
  Shield,
} from 'lucide-react';
import { useSignup } from '../hooks/use-auth';

const features = [
  { icon: CheckSquare, label: 'Tasks & Projects' },
  { icon: Wallet, label: 'Finance Tracking' },
  { icon: Calendar, label: 'Calendar & Events' },
  { icon: BookOpen, label: 'Knowledge Base' },
  { icon: Zap, label: 'Quick Capture' },
  { icon: Shield, label: 'Private & Secure' },
];

export function SignupPage() {
  const signup = useSignup();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    signup.mutate({ name, email, password });
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
          <div className="mb-4 flex items-center gap-4">
            <img src="/logo1.png" alt="AVENLO" className="h-14 w-14 rounded-2xl object-contain ring-1 ring-white/10 shadow-lg shadow-primary/20" />
            <div>
              <span className="text-3xl font-bold text-foreground tracking-tight">AVENLO</span>
              <p className="text-sm text-muted-foreground mt-0.5">Your Life. In Sync.</p>
            </div>
          </div>
          <p className="mb-10 max-w-md text-base text-muted-foreground/80 leading-relaxed">
            A centralized personal management platform. Productivity, finance, knowledge — everything in one place.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, label }, i) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-xl border border-border/40 bg-card/30 px-4 py-3 backdrop-blur-sm animate-card-in transition-all hover:border-primary/20 hover:bg-card/50"
                style={{ '--i': i } as React.CSSProperties}
              >
                <div className="rounded-lg bg-primary/10 p-1.5">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{label}</span>
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
          <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
            <img src="/logo1.png" alt="AVENLO" className="h-12 w-12 rounded-2xl object-contain ring-1 ring-white/10 shadow-lg shadow-primary/20" />
            <span className="text-xl font-bold text-foreground tracking-tight">AVENLO</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Set up AVENLO in under a minute
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
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
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-input px-3 pr-10 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="At least 8 characters"
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
              disabled={signup.isPending}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-md hover:shadow-primary/30 disabled:opacity-50 disabled:shadow-none"
            >
              {signup.isPending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Create account
            </button>
          </form>

          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary transition-colors hover:text-primary-hover"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
