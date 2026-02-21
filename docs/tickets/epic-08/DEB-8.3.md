---
id: DEB-8.3
title: Create Debater Card Component
ePic: Frontend - Debate View Page
priority: P0
status: TODO
points: 3
assignee: TBD
labels: [frontend, components, ui]
---

## Description
Build the component showing one debater's current state.

## Acceptance Criteria
- [ ] Create `DebateCard` component
- [ ] Display debater name and avatar
- [ ] Show streaming content with typing cursor
- [ ] Highlight current speaker with ring border
- [ ] Show "Speaking..." badge when active
- [ ] Show "Thinking..." or "Waiting..." when inactive

## Files Created
- `components/debate-card.tsx`

## Definition of Done
- [ ] Component renders correctly
- [ ] Updates in real-time
- [ ] Visual states clear

## Code Template
```tsx
// components/debate-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DebateCardProps {
  name: string;
  isCurrentSpeaker: boolean;
  isTyping: boolean;
  content: string;
}

export function DebateCard({ name, isCurrentSpeaker, isTyping, content }: DebateCardProps) {
  return (
    <Card 
      className={`bg-zinc-900/50 border-zinc-800 ${
        isCurrentSpeaker ? 'ring-2 ring-orange-500' : ''
      }`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          {name}
          {isCurrentSpeaker && (
            <Badge variant="secondary" className="animate-pulse">
              Speaking...
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isTyping ? (
          <div className="prose prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{content}</p>
            <span className="inline-block w-2 h-4 bg-orange-500 animate-pulse ml-1" />
          </div>
        ) : (
          <p className="text-zinc-500 italic">
            {isCurrentSpeaker ? 'Thinking...' : 'Waiting...'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

## Dependencies
- DEB-1.2 (shadcn components)
- DEB-2.1 (TypeScript types)

## Blocks
None (used by 8.2)
