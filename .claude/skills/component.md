---
name: component
description: Create a new UI component following the LifeOS design system (dark theme, Shadcn/ui based)
user_invocable: true
---

# Create a New UI Component

## Determine Component Type

1. **Shadcn/ui primitive** → Add via `npx shadcn@latest add <component>` in `apps/frontend/`
2. **Shared component** (used across modules) → `apps/frontend/src/components/shared/`
3. **Layout component** (shell, sidebar, topbar) → `apps/frontend/src/components/layout/`
4. **Module-specific component** → `apps/frontend/src/modules/<module>/components/`

## Design System Rules

Always follow the design system defined in CLAUDE.md:

### Dark Theme Colors
Use CSS variables, never hardcoded hex values:
- Backgrounds: `bg-background`, `bg-card`, `bg-sidebar`
- Text: `text-foreground`, `text-muted-foreground`
- Borders: `border-border`
- Accents: `text-primary`, `text-success`, `text-warning`, `text-danger`

### Component Structure
```tsx
interface ComponentNameProps {
  // typed props
}

export function ComponentName({ ...props }: ComponentNameProps) {
  return (
    // JSX
  );
}
```

### Key UI Patterns

**Stat Card** (for dashboard metrics):
```tsx
<Card className="bg-card border-border">
  <CardContent className="p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </div>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </div>
  </CardContent>
</Card>
```

**Page Header**:
```tsx
<div className="mb-6">
  <h1 className="text-xl font-semibold text-foreground">{title}</h1>
  <p className="text-sm text-muted-foreground mt-1">{description}</p>
</div>
```

**Chart Card** (for data visualizations):
```tsx
<Card className="bg-card border-border">
  <CardHeader className="pb-2">
    <CardTitle className="text-base font-medium">{title}</CardTitle>
    <CardDescription className="text-xs">{subtitle}</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Recharts component */}
  </CardContent>
</Card>
```

**Empty State**:
```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Icon className="h-12 w-12 text-muted-foreground mb-4" />
  <h3 className="text-base font-medium text-foreground">{title}</h3>
  <p className="text-sm text-muted-foreground mt-1 max-w-sm">{message}</p>
  <Button className="mt-4" onClick={onAction}>{actionLabel}</Button>
</div>
```

### Responsive
- Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`
- Cards: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Stat cards: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4`

### Imports
- Icons: `import { IconName } from 'lucide-react'`
- UI primitives: `import { Button } from '@/components/ui/button'`
- Always import from the closest barrel export
