---
name: api-endpoint
description: Create a new Express API endpoint with validation, service, and error handling
user_invocable: true
---

# Create a New API Endpoint

## Locate the Module

The endpoint belongs in `apps/backend/src/modules/<module>/`. If the module directory doesn't exist yet, use the `new-module` skill instead.

## Router Pattern

```typescript
// <module>.router.ts
import { Router } from 'express';
import { <module>Service } from './<module>.service';
import { validate } from '../../middleware/validate';
import { create<Module>Schema, update<Module>Schema, query<Module>Schema } from './<module>.validator';

const router = Router();

router.get('/', validate(query<Module>Schema, 'query'), async (req, res, next) => {
  try {
    const result = await <module>Service.findAll(req.query);
    res.json({ data: result.items, meta: { total: result.total, page: result.page } });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const item = await <module>Service.findById(req.params.id);
    if (!item) return res.status(404).json({ error: { message: 'Not found', code: 'NOT_FOUND' } });
    res.json({ data: item });
  } catch (err) {
    next(err);
  }
});

router.post('/', validate(create<Module>Schema), async (req, res, next) => {
  try {
    const item = await <module>Service.create(req.body);
    res.status(201).json({ data: item });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', validate(update<Module>Schema), async (req, res, next) => {
  try {
    const item = await <module>Service.update(req.params.id, req.body);
    res.json({ data: item });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await <module>Service.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export { router as <module>Router };
```

## Validator Pattern

```typescript
// <module>.validator.ts
import { z } from 'zod';

export const create<Module>Schema = z.object({
  // required fields
});

export const update<Module>Schema = create<Module>Schema.partial();

export const query<Module>Schema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  // module-specific filters
});
```

## Service Pattern

```typescript
// <module>.service.ts
import { prisma } from '../../lib/prisma';

export const <module>Service = {
  async findAll(params: QueryParams) {
    const { page, limit, search, sortBy, sortOrder, ...filters } = params;
    const where = { deletedAt: null, ...buildWhereClause(filters) };
    const [items, total] = await Promise.all([
      prisma.<model>.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
      }),
      prisma.<model>.count({ where }),
    ]);
    return { items, total, page };
  },

  async findById(id: string) {
    return prisma.<model>.findFirst({ where: { id, deletedAt: null } });
  },

  async create(data: CreateDTO) {
    return prisma.<model>.create({ data });
  },

  async update(id: string, data: UpdateDTO) {
    return prisma.<model>.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.<model>.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};
```

## Register the Route

In `apps/backend/src/app.ts`:
```typescript
import { <module>Router } from './modules/<module>';
app.use('/api/<module>', <module>Router);
```

## Test the Endpoint

After creating, verify with curl:
```bash
curl http://localhost:3001/api/<module> | jq .
```
