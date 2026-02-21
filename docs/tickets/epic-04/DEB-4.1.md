---
id: DEB-4.1
title: Create LLM Client Module
ePic: LLM Integration Layer
priority: P0
status: TODO
points: 5
assignee: TBD
labels: [llm, openrouter, streaming]
---

## Description
Build the LLM client that interfaces with OpenRouter API for streaming responses.

## Acceptance Criteria
- [ ] Configure OpenAI client with OpenRouter base URL
- [ ] Implement `streamDebateResponse` async generator function
- [ ] Support reasoning filtering via `<reasoning>` tags
- [ ] Handle streaming tokens properly
- [ ] Implement timeout handling (30s per turn)
- [ ] Add retry logic for API failures

## Files Created
- `lib/llm.ts`

## Definition of Done
- [ ] Can stream responses from OpenRouter
- [ ] Reasoning filtered correctly
- [ ] Handles errors gracefully

## Code Template
```typescript
// lib/llm.ts
import { OpenAI } from 'openai';
import { DebaterConfig, Turn, Speaker } from './types';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'LLM Debate Arena',
  },
});

export interface StreamResponse {
  content: string;
  reasoning?: string;
}

export async function* streamDebateResponse(
  debater: DebaterConfig,
  topic: string,
  previousTurns: Turn[],
  opponentObjective?: string
): AsyncGenerator<string, StreamResponse, unknown> {
  const messages = buildMessages(debater, topic, previousTurns, opponentObjective);
  
  const stream = await openai.chat.completions.create({
    model: debater.model,
    messages,
    stream: true,
    temperature: 0.7,
    max_tokens: 1000,
  });

  let fullContent = '';
  let fullReasoning = '';
  let isInReasoning = false;

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    
    if (content.includes('<reasoning>')) {
      isInReasoning = true;
      continue;
    }
    if (content.includes('</reasoning>')) {
      isInReasoning = false;
      continue;
    }
    
    if (isInReasoning) {
      fullReasoning += content;
    } else {
      fullContent += content;
      yield content;
    }
  }

  return {
    content: fullContent.trim(),
    reasoning: fullReasoning.trim() || undefined,
  };
}

function buildMessages(
  debater: DebaterConfig,
  topic: string,
  previousTurns: Turn[],
  opponentObjective?: string
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  // Implementation in DEB-4.2
}
```

## Dependencies
- DEB-1.3 (Dependencies installed)
- DEB-1.4 (Environment configured)
- DEB-2.1 (TypeScript types)

## Blocks
4.2, 4.3, 5.1
