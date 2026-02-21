---
id: DEB-8.1
title: Create Debate View Layout
ePic: Frontend - Debate View Page
priority: P0
status: TODO
points: 3
assignee: TBD
labels: [frontend, ui, debate-view]
---

## Description
Build the debate view page layout with header, debate cards, and control bar.

## Acceptance Criteria
- [ ] Create route at `/debate/[id]`
- [ ] Build header with:
  - Debate topic title
  - Connection status badge
  - Debater names
- [ ] Create main content area with debate cards
- [ ] Add debate log section
- [ ] Responsive design

## Files Created
- `app/debate/[id]/page.tsx`

## Definition of Done
- [ ] Layout renders correctly
- [ ] All sections visible
- [ ] Mobile responsive

## Code Template
```tsx
// app/debate/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';

export default function DebatePage() {
  const params = useParams();
  const debateId = params.id as string;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{/* Debate topic */}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-zinc-400">
                Debater A vs Debater B
              </span>
            </div>
          </div>
          
          {/* Controls will go here */}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Debate cards */}
        {/* Debate log */}
      </main>
    </div>
  );
}
```

## Dependencies
- DEB-1.1 (Next.js setup)
- DEB-1.2 (shadcn components)

## Blocks
8.2, 8.3, 8.4, 8.5, 8.6
