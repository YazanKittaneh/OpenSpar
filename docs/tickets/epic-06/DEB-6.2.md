---
id: DEB-6.2
title: Create SSE Stream Route (Alternative/Backup)
ePic: API Routes
priority: P1
status: TODO
points: 5
assignee: TBD
labels: [api, sse, streaming]
---

## Description
Create Server-Sent Events endpoint for streaming debate updates (as backup to Convex subscriptions).

## Acceptance Criteria
- [ ] `GET /api/debates/[id]/stream` - SSE endpoint
- [ ] Implement proper SSE headers
- [ ] Stream events: `debate.started`, `turn.started`, `token`, `turn.completed`, `debate.completed`
- [ ] Handle client disconnections
- [ ] Support reconnection with state recovery
- [ ] Manage connection lifecycle

## Files Created
- `app/api/debates/[id]/stream/route.ts`

## Definition of Done
- [ ] SSE connection stays open
- [ ] Events stream in real-time
- [ ] Reconnection works

## Code Template
```typescript
// app/api/debates/[id]/stream/route.ts
import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const debateId = params.id;
  
  const encoder = new TextEncoder();
  let isClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: any) => {
        if (!isClosed) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        }
      };

      try {
        // Send initial state
        send({ type: 'debate.started', debate: { id: debateId } });
        
        // Subscribe to Convex and forward events
        // ... subscription logic
        
        controller.close();
      } catch (error) {
        send({ type: 'error', message: 'Stream error' });
        controller.close();
      }
    },

    cancel() {
      isClosed = true;
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

## Dependencies
- DEB-1.1 (Next.js setup)
- DEB-3.3 (Subscriptions)

## Blocks
8.2 (Real-time streaming - optional backup)
