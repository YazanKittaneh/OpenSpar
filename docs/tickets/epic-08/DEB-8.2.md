---
id: DEB-8.2
title: Implement Real-time Debate Streaming
ePic: Frontend - Debate View Page
priority: P0
status: TODO
points: 8
assignee: TBD
labels: [frontend, realtime, convex, streaming]
---

## Description
Connect to Convex subscriptions for real-time debate updates and streaming.

## Acceptance Criteria
- [ ] Connect to `watchDebate` subscription
- [ ] Connect to `watchTurns` subscription
- [ ] Handle debate state updates
- [ ] Stream tokens in real-time to debater cards
- [ ] Show typing indicator during streaming
- [ ] Handle connection errors and reconnection
- [ ] Update UI on each event type:
  - `debate.started` - Initialize state
  - `turn.started` - Show speaker indicator
  - `token` - Append to streaming content
  - `turn.completed` - Move to debate log
  - `debate.completed` - Show winner

## Files Modified
- `app/debate/[id]/page.tsx`

## Definition of Done
- [ ] Real-time updates work
- [ ] Streaming visible to user
- [ ] Reconnection automatic

## Code Template
```tsx
// Inside debate page component
import { useEffect, useState } from 'react';
import { useConvex, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function DebatePage() {
  const { id } = useParams();
  const debate = useQuery(api.debates.getDebate, { id: id as string });
  const turns = useQuery(api.turns.getDebateTurns, { debateId: id as string });
  
  const [streamingContent, setStreamingContent] = useState({ A: '', B: '' });
  const [isConnected, setIsConnected] = useState(false);
  const [winner, setWinner] = useState(null);
  
  useEffect(() => {
    if (debate) {
      setIsConnected(true);
      
      // Handle different debate statuses
      switch (debate.status) {
        case 'running':
          // Debate is active
          break;
        case 'completed':
          setWinner(debate.winner);
          break;
      }
    }
  }, [debate]);

  // ... rest of component
}
```

## Dependencies
- DEB-1.3 (Convex installed)
- DEB-2.1 (TypeScript types)
- DEB-3.3 (Subscriptions)
- DEB-5.1 (Debate orchestrator)
- DEB-8.1 (Debate view layout)

## Blocks
8.3, 8.4, 8.5, 8.6
