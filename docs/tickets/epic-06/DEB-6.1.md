---
id: DEB-6.1
title: Create Debate API Routes
ePic: API Routes
priority: P0
status: TODO
points: 3
assignee: TBD
labels: [api, nextjs, routes]
---

## Description
Build REST API endpoints for debate CRUD operations.

## Acceptance Criteria
- [ ] `POST /api/debates` - Create new debate
  - Validate input
  - Generate unique ID
  - Store in Convex
  - Return debate object
- [ ] `GET /api/debates` - List debates (optional for MVP)
- [ ] `GET /api/debates/[id]` - Get single debate
- [ ] Proper error handling with HTTP status codes

## Files Created
- `app/api/debates/route.ts`
- `app/api/debates/[id]/route.ts`

## Definition of Done
- [ ] API endpoints respond correctly
- [ ] Error handling works

## Code Template
```typescript
// app/api/debates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, debaterA, debaterB, maxTurns = 10, winningCondition = 'self-terminate' } = body;

    if (!topic || !debaterA || !debaterB) {
      return NextResponse.json(
        { error: 'Missing required fields: topic, debaterA, debaterB' },
        { status: 400 }
      );
    }

    // Create debate via Convex
    const debateId = await fetch(`${process.env.CONVEX_SITE_URL}/api/createDebate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        debaterA,
        debaterB,
        maxTurns,
        winningCondition,
      }),
    }).then(r => r.json());

    return NextResponse.json({ debate: { id: debateId, ...body } }, { status: 201 });
  } catch (error) {
    console.error('Error creating debate:', error);
    return NextResponse.json(
      { error: 'Failed to create debate' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
```

## Dependencies
- DEB-1.1 (Next.js setup)
- DEB-2.1 (TypeScript types)
- DEB-3.2 (Mutations)

## Blocks
7.2 (Setup page form submission)
