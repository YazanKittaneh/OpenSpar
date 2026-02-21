---
id: DEB-8.6
title: Create Winner Display Component
ePic: Frontend - Debate View Page
priority: P1
status: TODO
points: 2
assignee: TBD
labels: [frontend, components, ui]
---

## Description
Build the winner announcement UI shown when debate ends.

## Acceptance Criteria
- [ ] Create `WinnerBanner` component
- [ ] Show trophy icon
- [ ] Display winner name or "Draw"
- [ ] Show reason for ending
- [ ] Celebratory styling (gradient, animation)
- [ ] Option to start new debate

## Files Created
- `components/winner-banner.tsx`

## Definition of Done
- [ ] Banner displays on completion
- [ ] Visual impact appropriate
- [ ] New debate button works

## Code Template
```tsx
// components/winner-banner.tsx
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface WinnerBannerProps {
  winner: 'A' | 'B' | 'draw' | null;
  winnerName: string;
  reason: string;
}

export function WinnerBanner({ winner, winnerName, reason }: WinnerBannerProps) {
  return (
    <div className="mb-8 text-center">
      <div className="inline-flex items-center gap-4 bg-gradient-to-r from-yellow-600 to-orange-600 px-8 py-6 rounded-2xl shadow-lg animate-in fade-in zoom-in duration-500">
        <Trophy className="w-12 h-12 text-yellow-200" />
        <div className="text-left">
          <div className="text-sm text-yellow-100 opacity-80">Winner</div>
          <div className="text-3xl font-bold text-white">
            {winner === 'draw' ? 'Draw' : winnerName}
          </div>
          <div className="text-sm text-yellow-100 mt-1">{reason}</div>
        </div>
      </div>
      
      <div className="mt-6">
        <Link href="/">
          <Button variant="outline" size="lg">
            Start New Debate
          </Button>
        </Link>
      </div>
    </div>
  );
}
```

## Dependencies
- DEB-1.2 (shadcn components)

## Blocks
None (used by 8.2)
