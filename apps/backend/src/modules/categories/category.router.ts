import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { validate } from '../../middleware/validate.js';
import { createCategorySchema } from './category.validator.js';
import * as categoryService from './category.service.js';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type = req.query.type as string | undefined;
    const categories = type
      ? await categoryService.listByType(type)
      : await categoryService.listAll();
    res.json({ data: categories });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  validate(createCategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await categoryService.create(req.body.name, req.body.type);
      res.status(201).json({ data: category });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002') {
        res.status(400).json({ error: { message: 'Category already exists', code: 'DUPLICATE' } });
        return;
      }
      next(err);
    }
  },
);

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await categoryService.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export { router as categoryRouter };
