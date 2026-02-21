---
id: DEB-4.2
title: Implement System Prompt Builder
ePic: LLM Integration Layer
priority: P0
status: TODO
points: 3
assignee: TBD
labels: [llm, prompts, openrouter]
---

## Description
Create dynamic system prompt generation for debaters based on debate context.

## Acceptance Criteria
- [ ] Create `buildMessages` function
- [ ] Generate contextual system prompts
- [ ] Include debate topic and objectives
- [ ] Add conversation history to messages
- [ ] Support custom objectives per debater
- [ ] Format opponent information correctly

## Files Created
- `lib/llm.ts` (message builder)

## Definition of Done
- [ ] Prompts are contextual and relevant
- [ ] History properly formatted for LLM

## Code Template
```typescript
// lib/llm.ts

function buildMessages(
  debater: DebaterConfig,
  topic: string,
  previousTurns: Turn[],
  opponentObjective?: string
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  const objective = debater.objective || `Convincingly argue your position on: ${topic}`;
  const opponentGoal = opponentObjective || 'to convince others of their perspective';
  
  const systemPrompt = debater.systemPrompt || `
You are ${debater.name}, participating in a debate.

Your objective: ${objective}

The topic: "${topic}"

Your opponent is trying ${opponentGoal}.

Rules:
1. Make persuasive, well-reasoned arguments
2. Address points your opponent raised
3. Be respectful but firm in your position
4. You may use <reasoning>tags for your private thinking</reasoning> - opponents won't see this
5. Keep responses concise (2-4 paragraphs)

Your turn to speak:
`.trim();

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  // Add conversation history (only public content, not reasoning)
  for (const turn of previousTurns) {
    messages.push({
      role: turn.speaker === 'A' ? 'assistant' : 'user',
      content: turn.content,
    });
  }

  return messages;
}
```

## Dependencies
- DEB-2.1 (TypeScript types)
- DEB-4.1 (LLM client)

## Blocks
5.1 (Debate orchestrator)
