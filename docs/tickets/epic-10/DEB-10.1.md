---
id: DEB-10.1
title: Add Loading States
ePic: Polish & Launch Preparation
priority: P1
status: TODO
points: 2
assignee: TBD
labels: [ui, loading, polish]
---

## Description
Implement loading states and skeletons throughout the app.

## Acceptance Criteria
- [ ] Add loading skeleton for setup page
- [ ] Add loading state for debate creation
- [ ] Add loading spinner for debate view
- [ ] Add loading states for async actions
- [ ] Ensure no layout shift during loading

## Files Modified
- `app/page.tsx`
- `app/debate/[id]/page.tsx`
- Various component files

## Definition of Done
- [ ] No jarring loading experiences
- [ ] Skeletons match final layout

## Code Template
```tsx
// Loading skeleton for debate card
import { Skeleton } from '@/components/ui/skeleton';

export function DebateCardSkeleton() {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-24 w-full" />
      </CardContent>
    </Card>
  );
}
```

## Dependencies
- DEB-1.2 (shadcn components)

## Blocks
None
