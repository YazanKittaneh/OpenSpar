---
id: DEB-9.2
title: Handle API Errors
ePic: Error Handling & Edge Cases
priority: P1
status: TODO
points: 3
assignee: TBD
labels: [error-handling, api, resilience]
---

## Description
Implement comprehensive API error handling throughout the app.

## Acceptance Criteria
- [ ] Handle OpenRouter API failures
  - Retry once, then skip turn
  - Show error indicator
- [ ] Handle Convex connection errors
  - Auto-retry with backoff
  - Show connection status
- [ ] Handle network errors
  - Queue actions offline
  - Sync when reconnected
- [ ] Display error banners/toasts

## Files Modified
- Various API files
- `lib/llm.ts`
- `app/debate/[id]/page.tsx`

## Definition of Done
- [ ] All API calls have error handling
- [ ] Users informed of issues
- [ ] Recovery automatic where possible

## Code Template
```typescript
// Error handling wrapper for LLM calls
export async function streamWithRetry(
  fn: () => AsyncGenerator<string>,
  maxRetries = 1
): Promise<AsyncGenerator<string>> {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  }
  
  throw lastError;
}
```

## Dependencies
- DEB-4.1 (LLM client)

## Blocks
None
