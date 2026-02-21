---
id: DEB-6.3
title: Create Action API Route
ePic: API Routes
priority: P1
status: TODO
points: 2
assignee: TBD
labels: [api, actions, routes]
---

## Description
Build API endpoint for user actions during debates.

## Acceptance Criteria
- [ ] `POST /api/debates/[id]/action` - Process user action
- [ ] Accept action type and payload
- [ ] Validate action
- [ ] Apply action to debate state
- [ ] Return success/error response

## Files Created
- `app/api/debates/[id]/action/route.ts`

## Definition of Done
- [ ] Actions processed correctly
- [ ] State updated in Convex

## Code Template
```typescript
// app/api/debates/[id]/action/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const debateId = params.id;
    const action = await req.json();

    // Validate action
    const validActions = ['pause', 'resume', 'skip', 'inject'];
    if (!validActions.includes(action.type)) {
      return NextResponse.json(
        { error: 'Invalid action type' },
        { status: 400 }
      );
    }

    // Send to Convex
    await fetch(`${process.env.CONVEX_SITE_URL}/api/processUserAction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ debateId, action }),
    });

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error('Action error:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}
```

## Dependencies
- DEB-1.1 (Next.js setup)
- DEB-5.2 (User actions handler)

## Blocks
8.4 (Control bar)
