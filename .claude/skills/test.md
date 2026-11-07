---
name: test
description: Run tests or create test files for LifeOS modules
user_invocable: true
---

# Testing Workflow

## Running Tests

```bash
# All tests
pnpm test

# Frontend tests (Vitest)
cd apps/frontend && npx vitest run

# Backend tests (Vitest)
cd apps/backend && npx vitest run

# Watch mode
cd apps/frontend && npx vitest
cd apps/backend && npx vitest

# Single file
cd apps/backend && npx vitest run src/modules/tasks/task.service.test.ts

# With coverage
pnpm test -- --coverage
```

## Test File Locations

- Backend service tests: `apps/backend/src/modules/<module>/<module>.service.test.ts`
- Backend route tests: `apps/backend/src/modules/<module>/<module>.router.test.ts`
- Frontend component tests: `apps/frontend/src/modules/<module>/components/__tests__/`
- Frontend hook tests: `apps/frontend/src/modules/<module>/hooks/__tests__/`

## Backend Test Pattern

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { <module>Service } from './<module>.service';
import { prisma } from '../../lib/prisma';

vi.mock('../../lib/prisma', () => ({
  prisma: {
    <model>: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('<Module>Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns paginated results', async () => {
      // arrange, act, assert
    });
  });
});
```

## Frontend Component Test Pattern

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('...')).toBeInTheDocument();
  });
});
```

## What to Test

**Backend:**
- Service methods: CRUD operations, business logic, edge cases
- Validators: valid/invalid inputs, boundary values
- Router: HTTP status codes, response format, error handling

**Frontend:**
- Components: renders, user interactions, conditional rendering
- Hooks: data fetching states (loading, error, success), mutations

**Skip testing:**
- Prisma schema (tested by migration)
- Shadcn/ui primitives (tested upstream)
- Simple type re-exports
