import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error-handler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'lifeos-dev-secret-change-in-production';
const JWT_EXPIRES_IN = '1h';

const AVATAR_COLORS = [
  '#4E85DE', '#DE8863', '#22A06B', '#F4B942', '#C04741',
  '#9B59B6', '#1ABC9C', '#E74C3C', '#3498DB', '#E67E22',
  '#2ECC71', '#E84393', '#6C5CE7', '#00B894', '#FDCB6E',
];

function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

function toUserResponse(user: { id: string; name: string; email: string; avatarColor: string; createdAt: Date; updatedAt: Date }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarColor: user.avatarColor,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { userId: string } {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    throw new AppError(401, 'Invalid or expired token', 'INVALID_TOKEN');
  }
}

export async function signup(input: { name: string; email: string; password: string }) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError(409, 'Email already registered', 'EMAIL_EXISTS');
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      avatarColor: randomAvatarColor(),
    },
  });

  await prisma.userSettings.create({ data: { userId: user.id } });

  return {
    user: toUserResponse(user),
    token: generateToken(user.id),
  };
}

export async function login(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) {
    throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  return {
    user: toUserResponse(user),
    token: generateToken(user.id),
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
  }
  return toUserResponse(user);
}

export async function updateProfile(userId: string, input: { name?: string; email?: string }) {
  if (input.email) {
    const existing = await prisma.user.findFirst({
      where: { email: input.email, id: { not: userId } },
    });
    if (existing) {
      throw new AppError(409, 'Email already in use', 'EMAIL_EXISTS');
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: input,
  });

  return toUserResponse(user);
}

export async function changePassword(userId: string, input: { currentPassword: string; newPassword: string }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
  }

  const valid = await bcrypt.compare(input.currentPassword, user.password);
  if (!valid) {
    throw new AppError(400, 'Current password is incorrect', 'WRONG_PASSWORD');
  }

  const hashedPassword = await bcrypt.hash(input.newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
}

export async function getSettings(userId: string) {
  let settings = await prisma.userSettings.findUnique({ where: { userId } });
  if (!settings) {
    settings = await prisma.userSettings.create({ data: { userId } });
  }
  return {
    id: settings.id,
    mcpServerKey: settings.mcpServerKey,
    obsidianVault: settings.obsidianVault,
    currency: settings.currency,
    dateFormat: settings.dateFormat,
    weekStartsOn: settings.weekStartsOn,
    emailNotifications: settings.emailNotifications,
    browserNotifications: settings.browserNotifications,
  };
}

export async function updateSettings(userId: string, input: Record<string, unknown>) {
  let settings = await prisma.userSettings.findUnique({ where: { userId } });
  if (!settings) {
    settings = await prisma.userSettings.create({ data: { userId } });
  }

  const updated = await prisma.userSettings.update({
    where: { userId },
    data: input,
  });

  return {
    id: updated.id,
    mcpServerKey: updated.mcpServerKey,
    obsidianVault: updated.obsidianVault,
    currency: updated.currency,
    dateFormat: updated.dateFormat,
    weekStartsOn: updated.weekStartsOn,
    emailNotifications: updated.emailNotifications,
    browserNotifications: updated.browserNotifications,
  };
}
