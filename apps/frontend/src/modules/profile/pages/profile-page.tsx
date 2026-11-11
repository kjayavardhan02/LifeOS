import { useState } from 'react';
import { Eye, EyeOff, Save, KeyRound, UserCog } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { getAvatarUrl } from '@/lib/avatar';
import { useUpdateProfile, useChangePassword } from '../hooks/use-profile';

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const avatarUrl = getAvatarUrl(user?.id || 'default', 160);

  function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    const updates: Record<string, string> = {};
    if (name !== user?.name) updates.name = name;
    if (email !== user?.email) updates.email = email;
    if (Object.keys(updates).length === 0) return;
    updateProfile.mutate(updates);
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) return;
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
      },
    );
  }

  const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account details</p>
      </div>

      {/* Avatar + name display */}
      <div className="mb-8 flex items-center gap-5">
        <div className="h-20 w-20 overflow-hidden rounded-full shadow-lg">
          <img src={avatarUrl} alt={user?.name || 'Avatar'} className="h-full w-full object-cover" />
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">{user?.name}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <p className="mt-1 text-xs text-muted">
            Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'}
          </p>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="mb-8 rounded-lg border border-border bg-card p-6">
        <div className="mb-5 flex items-center gap-2">
          <UserCog className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Edit Profile</h2>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label htmlFor="profile-name" className="mb-1.5 block text-sm font-medium text-foreground">
              Name
            </label>
            <input
              id="profile-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="profile-email" className="mb-1.5 block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            disabled={updateProfile.isPending || (name === user?.name && email === user?.email)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {updateProfile.isPending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-5 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-warning" />
          <h2 className="text-base font-semibold text-foreground">Change Password</h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label htmlFor="current-pw" className="mb-1.5 block text-sm font-medium text-foreground">
              Current Password
            </label>
            <div className="relative">
              <input
                id="current-pw"
                type={showCurrentPw ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-input px-3 pr-10 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="new-pw" className="mb-1.5 block text-sm font-medium text-foreground">
              New Password
            </label>
            <div className="relative">
              <input
                id="new-pw"
                type={showNewPw ? 'text' : 'password'}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-input px-3 pr-10 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
              >
                {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="confirm-pw" className="mb-1.5 block text-sm font-medium text-foreground">
              Confirm New Password
            </label>
            <input
              id="confirm-pw"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`h-10 w-full rounded-lg border bg-input px-3 text-sm text-foreground outline-none transition-colors focus:ring-1 ${
                passwordMismatch
                  ? 'border-danger focus:border-danger focus:ring-danger'
                  : 'border-border focus:border-primary focus:ring-primary'
              }`}
              placeholder="Re-enter new password"
            />
            {passwordMismatch && (
              <p className="mt-1 text-xs text-danger">Passwords do not match</p>
            )}
          </div>
          <button
            type="submit"
            disabled={changePassword.isPending || passwordMismatch || !currentPassword || !newPassword}
            className="flex items-center gap-2 rounded-lg bg-warning px-4 py-2 text-sm font-medium text-background transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {changePassword.isPending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}
