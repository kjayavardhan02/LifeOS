import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { readdir, stat, access } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import { validate } from '../../middleware/validate.js';
import {
  updateProfileSchema,
  changePasswordSchema,
  updateSettingsSchema,
} from '../auth/auth.validator.js';
import * as authService from '../auth/auth.service.js';

type AuthRequest = Request & { userId: string };

const router = Router();

router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest;
    const user = await authService.getMe(userId);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

router.patch(
  '/me',
  validate(updateProfileSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req as AuthRequest;
      const user = await authService.updateProfile(userId, req.body);
      res.json({ data: user });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/me/password',
  validate(changePasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req as AuthRequest;
      await authService.changePassword(userId, req.body);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);

router.get('/me/settings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthRequest;
    const settings = await authService.getSettings(userId);
    res.json({ data: settings });
  } catch (err) {
    next(err);
  }
});

router.patch(
  '/me/settings',
  validate(updateSettingsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req as AuthRequest;
      const settings = await authService.updateSettings(userId, req.body);
      res.json({ data: settings });
    } catch (err) {
      next(err);
    }
  },
);

router.get('/browse-dirs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestedPath = (req.query.path as string) || homedir();
    const resolvedPath = requestedPath === '~' ? homedir() : requestedPath;

    await access(resolvedPath);
    const entries = await readdir(resolvedPath, { withFileTypes: true });

    const dirs = [];
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      const fullPath = join(resolvedPath, entry.name);
      let hasChildren = false;
      try {
        const sub = await readdir(fullPath, { withFileTypes: true });
        hasChildren = sub.some((s) => s.isDirectory() && !s.name.startsWith('.'));
      } catch {
        // no permission to read
      }
      dirs.push({ name: entry.name, path: fullPath, hasChildren });
    }

    dirs.sort((a, b) => a.name.localeCompare(b.name));

    res.json({
      data: {
        current: resolvedPath,
        parent: join(resolvedPath, '..') !== resolvedPath ? join(resolvedPath, '..') : null,
        directories: dirs,
      },
    });
  } catch {
    res.status(400).json({ error: { message: 'Cannot access directory', code: 'DIR_NOT_ACCESSIBLE' } });
  }
});

export { router as profileRouter };
