---
id: DEB-7.3
title: Add Available Models Configuration
ePic: Frontend - Setup Page
priority: P1
status: TODO
points: 2
assignee: TBD
labels: [config, models, setup]
---

## Description
Configure the list of available LLM models from OpenRouter.

## Acceptance Criteria
- [ ] Create models configuration list:
  - Claude 3.5 Sonnet
  - Claude 3 Opus
  - GPT-4
  - GPT-4 Turbo
  - Gemini Pro
  - Llama 3 70B
- [ ] Display model names in dropdowns
- [ ] Store model IDs for API calls

## Files Created
- `lib/config.ts`

## Definition of Done
- [ ] All models selectable
- [ ] Correct model IDs used

## Code Template
```typescript
// lib/config.ts
export const CONFIG = {
  // Models available through OpenRouter
  DEFAULT_MODELS: [
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
    { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus' },
    { id: 'openai/gpt-4', name: 'GPT-4' },
    { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo' },
    { id: 'google/gemini-pro', name: 'Gemini Pro' },
    { id: 'meta-llama/llama-3-70b', name: 'Llama 3 70B' },
  ],
  
  // API timeouts
  TURN_TIMEOUT_MS: 30000,
  MAX_TURNS_DEFAULT: 10,
  MAX_TURNS_LIMIT: 50,
  
  // Storage
  DEBATE_TTL_HOURS: 24,
  CLEANUP_INTERVAL_HOURS: 1,
} as const;
```

## Dependencies
None

## Blocks
7.2 (Configuration form)
