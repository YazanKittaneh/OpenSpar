---
id: DEB-7.2
title: Implement Debate Configuration Form
ePic: Frontend - Setup Page
priority: P0
status: TODO
points: 5
assignee: TBD
labels: [frontend, form, setup]
---

## Description
Create the form for configuring debate parameters.

## Acceptance Criteria
- [ ] Topic textarea with placeholder
- [ ] Debater A configuration:
  - Model dropdown (OpenRouter models)
  - Name display
  - Custom objective input (optional)
- [ ] Debater B configuration (same as A)
  - VS badge between debaters
- [ ] Settings section:
  - Max turns input (2-50, default 10)
  - Winning condition dropdown
- [ ] Form validation
- [ ] Loading state during submission

## Fields
- Topic: string (required)
- Debater A: `{ model: string, name: string, objective?: string }`
- Debater B: `{ model: string, name: string, objective?: string }`
- Max Turns: number (default: 10)
- Winning Condition: `'self-terminate' | 'user-decides' | 'ai-judge'`

## Files Modified
- `app/page.tsx`

## Definition of Done
- [ ] All fields functional
- [ ] Validation works
- [ ] Form submits to API

## Code Template
```tsx
// Form state and handlers (inside page.tsx)
const [topic, setTopic] = useState('');
const [debaterA, setDebaterA] = useState({
  model: 'anthropic/claude-3.5-sonnet',
  name: 'Claude',
});
const [debaterB, setDebaterB] = useState({
  model: 'openai/gpt-4',
  name: 'GPT-4',
});
const [maxTurns, setMaxTurns] = useState(10);
const [winningCondition, setWinningCondition] = useState('self-terminate');
const [isLoading, setIsLoading] = useState(false);

const handleStartDebate = async () => {
  if (!topic.trim()) return;
  
  setIsLoading(true);
  try {
    const response = await fetch('/api/debates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        debaterA,
        debaterB,
        maxTurns,
        winningCondition,
      }),
    });

    if (!response.ok) throw new Error('Failed to create debate');

    const { debate } = await response.json();
    router.push(`/debate/${debate.id}`);
  } catch (error) {
    console.error('Error starting debate:', error);
    alert('Failed to start debate. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

## Dependencies
- DEB-1.2 (shadcn components)
- DEB-2.1 (TypeScript types)
- DEB-6.1 (API routes)
- DEB-7.1 (Setup page layout)
- DEB-7.3 (Models config)

## Blocks
None
