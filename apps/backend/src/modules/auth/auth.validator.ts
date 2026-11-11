import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email('Invalid email address').optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export const updateSettingsSchema = z.object({
  mcpServerKey: z.string().nullable().optional(),
  obsidianVault: z.string().nullable().optional(),
  currency: z.string().optional(),
  dateFormat: z.string().optional(),
  weekStartsOn: z.string().optional(),
  emailNotifications: z.boolean().optional(),
  browserNotifications: z.boolean().optional(),
});
