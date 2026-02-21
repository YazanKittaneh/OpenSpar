---
id: DEB-8.5
title: Create Debate Log Component
ePic: Frontend - Debate View Page
priority: P1
status: TODO
points: 3
assignee: TBD
labels: [frontend, components, log]
---

## Description
Build the scrollable debate history log showing all completed turns.

## Acceptance Criteria
- [ ] Create `DebateLog` component
- [ ] Show list of all turns
- [ ] Each turn displays:
  - Turn number badge
  - Debater name
  - Full content
  - Timestamp
- [ ] Auto-scroll to latest turn
- [ ] Collapsible on mobile

## Files Created
- `components/debate-log.tsx`

## Definition of Done
- [ ] Log displays all turns
- [ ] Auto-scrolls correctly
- [ ] Readable formatting

## Code Template
```tsx
// components/debate-log.tsx
import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Turn, Speaker } from '@/lib/types';

interface DebateLogProps {
  turns: Turn[];
  getDebaterName: (speaker: Speaker) => string;
}

export function DebateLog({ turns, getDebaterName }: DebateLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Debate Log</h2>
      <div ref={scrollRef} className="space-y-4 max-h-[500px] overflow-y-auto">
        {turns.map((turn) => (
          <Card key={turn.number} className="bg-zinc-900/30 border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Badge variant="outline">Turn {turn.number}</Badge>
                <div className="flex-1">
                  <div className="font-semibold text-orange-400 mb-2">
                    {getDebaterName(turn.speaker)}
                  </div>
                  <p className="text-zinc-300 whitespace-pre-wrap">{turn.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

## Dependencies
- DEB-1.2 (shadcn components)
- DEB-2.1 (TypeScript types)

## Blocks
None (used by 8.2)
