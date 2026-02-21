---
id: DEB-4.3
title: Implement Debate Intelligence
ePic: LLM Integration Layer
priority: P1
status: TODO
points: 3
assignee: TBD
labels: [llm, intelligence, detection]
---

## Description
Add intelligence features to detect debate state (agreement, circular arguments, etc.).

## Acceptance Criteria
- [ ] Implement `checkForAgreement` function
  - Detect phrases: "I agree", "I concede", "you're right", etc.
- [ ] Implement `checkForCircularArgument` function
  - Detect 3+ similar consecutive turns
  - Use simple similarity comparison
- [ ] Add confidence scoring

## Files Created
- `lib/debate-intelligence.ts`

## Definition of Done
- [ ] Agreement detection works correctly
- [ ] Circular argument detection prevents infinite loops

## Code Template
```typescript
// lib/debate-intelligence.ts
import { Turn } from './types';

const AGREEMENT_PHRASES = [
  'i agree',
  'i concede',
  "you're right",
  'you are right',
  'fair point',
  'i accept',
  'convincing argument',
  'i cannot disagree',
];

export function checkForAgreement(content: string): boolean {
  const lower = content.toLowerCase();
  return AGREEMENT_PHRASES.some(phrase => lower.includes(phrase));
}

export function checkForCircularArgument(turns: Turn[]): boolean {
  if (turns.length < 6) return false;
  
  // Get last 3 turns from each debater
  const recentA = turns.filter(t => t.speaker === 'A').slice(-3);
  const recentB = turns.filter(t => t.speaker === 'B').slice(-3);
  
  if (recentA.length < 3 || recentB.length < 3) return false;
  
  // Simple similarity check: are they repeating the same phrases?
  const contents = [...recentA, ...recentB].map(t => t.content.toLowerCase());
  const uniqueContents = new Set(contents);
  
  // If 5+ out of 6 are very similar, it's circular
  return uniqueContents.size <= 2;
}

// Simple string similarity (Jaccard index on words)
export function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.toLowerCase().split(/\s+/));
  const words2 = new Set(str2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}
```

## Dependencies
- DEB-2.1 (TypeScript types)

## Blocks
5.1 (Debate orchestrator)
