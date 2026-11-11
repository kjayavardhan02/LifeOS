export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UserSettings {
  id: string;
  mcpServerKey: string | null;
  obsidianVault: string | null;
  currency: string;
  dateFormat: string;
  weekStartsOn: string;
  emailNotifications: boolean;
  browserNotifications: boolean;
}

export interface UpdateSettingsInput {
  mcpServerKey?: string | null;
  obsidianVault?: string | null;
  currency?: string;
  dateFormat?: string;
  weekStartsOn?: string;
  emailNotifications?: boolean;
  browserNotifications?: boolean;
}
