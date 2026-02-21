---
id: DEB-7.1
title: Create Setup Page Layout
ePic: Frontend - Setup Page
priority: P0
status: TODO
points: 3
assignee: TBD
labels: [frontend, ui, setup]
---

## Description
Build the main landing page with debate configuration form.

## Acceptance Criteria
- [ ] Create responsive layout with dark theme
- [ ] Add header with app title and description
- [ ] Style with Tailwind and shadcn components
- [ ] Ensure mobile-friendly design

## Files Modified
- `app/page.tsx`

## Definition of Done
- [ ] Page renders beautifully on all screen sizes
- [ ] Dark theme applied consistently

## Code Template
```tsx
// app/page.tsx
'use client';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 text-zinc-100">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            🥊 LLM Debate Arena
          </h1>
          <p className="text-zinc-400 text-lg">
            Pit two AI models against each other in structured debates
          </p>
        </div>

        {/* Configuration form will go here */}
      </div>
    </main>
  );
}
```

## Dependencies
- DEB-1.1 (Next.js setup)
- DEB-1.2 (shadcn components)

## Blocks
7.2, 7.3
