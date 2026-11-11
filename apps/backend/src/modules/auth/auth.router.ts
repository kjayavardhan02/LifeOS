import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { validate } from '../../middleware/validate.js';
import { signupSchema, loginSchema } from './auth.validator.js';
import * as authService from './auth.service.js';

const router = Router();

router.post(
  '/signup',
  validate(signupSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.signup(req.body);
      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/login',
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },
);

router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: { message: 'No token provided', code: 'NO_TOKEN' } });
      return;
    }
    const { userId } = authService.verifyToken(authHeader.slice(7));
    const user = await authService.getMe(userId);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

export { router as authRouter };
