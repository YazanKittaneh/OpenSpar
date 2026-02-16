# LLM Debate Arena Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Next.js webapp where two LLMs debate each other in real-time via SSE, with user controls and filtered reasoning.

**Architecture:** Server-Sent Events (SSE) with async turn orchestration. Next.js App Router handles API routes and streaming. In-memory state store for MVP. OpenRouter API for LLM access with token streaming.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, OpenRouter API

---

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- OpenRouter API key (get from openrouter.ai)

---

## Task 1: Initialize Next.js Project with shadcn/ui

**Files:**
- Create: Entire project structure

**Step 1: Create project with shadcn/ui**

```bash
npx shadcn@latest init --yes --template next --base-color zinc
```

Expected: Project scaffolded with Next.js, Tailwind, TypeScript, shadcn/ui

**Step 2: Install required shadcn components**

```bash
npx shadcn add button card select textarea badge separator
```

Expected: Components installed in `components/ui/`

**Step 3: Install additional dependencies**

```bash
npm install ai openrouter
```

Expected: Packages added to package.json

**Step 4: Create environment file**

Create: `.env.local`

```env
OPENROUTER_API_KEY=your_api_key_here
```

**Step 5: Commit initial setup**

```bash
git add .
git commit -m "chore: initialize Next.js project with shadcn/ui"
```

---

## Task 2: Define TypeScript Types

**Files:**
- Create: `lib/types.ts`

**Step 1: Write types file**

```typescript
// lib/types.ts

export type DebateStatus = 'created' | 'running' | 'paused' | 'completed' | 'aborted';
export type WinningCondition = 'self-terminate' | 'user-decides' | 'ai-judge';
export type Speaker = 'A' | 'B';

export interface DebaterConfig {
  model: string;
  name: string;
  systemPrompt?: string;
  objective?: string; // Optional custom objective
}

export interface Turn {
  number: number;
  speaker: Speaker;
  content: string;        // What opponent sees
  reasoning?: string;     // Private reasoning (filtered from opponent)
  timestamp: Date;
}

export interface Debate {
  id: string;
  topic: string;
  format: 'turn-based';
  maxTurns: number;
  winningCondition: WinningCondition;
  
  debaterA: DebaterConfig;
  debaterB: DebaterConfig;
  
  turns: Turn[];
  status: DebateStatus;
  winner?: Speaker | 'draw' | null;
  currentSpeaker: Speaker;
  
  createdAt: Date;
  updatedAt: Date;
}

export type UserActionType = 'pause' | 'resume' | 'skip' | 'inject';

export interface UserAction {
  type: UserActionType;
  payload?: string;
}

export type SSEEvent = 
  | { type: 'debate.started'; debate: Debate }
  | { type: 'turn.started'; speaker: Speaker; turnNumber: number }
  | { type: 'token'; speaker: Speaker; content: string }
  | { type: 'turn.completed'; speaker: Speaker; fullContent: string }
  | { type: 'debate.completed'; winner: Speaker | 'draw' | null; reason: string }
  | { type: 'action.processed'; action: UserAction }
  | { type: 'error'; message: string };
```

**Step 2: Verify types compile**

```bash
npx tsc --noEmit lib/types.ts
```

Expected: No errors

**Step 3: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add TypeScript types for debate system"
```

---

## Task 3: Create In-Memory State Store

**Files:**
- Create: `lib/store.ts`

**Step 1: Implement store with cleanup**

```typescript
// lib/store.ts
import { Debate } from './types';

const debates = new Map<string, Debate>();
const DEBATE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function createDebate(debate: Debate): void {
  debates.set(debate.id, debate);
}

export function getDebate(id: string): Debate | undefined {
  return debates.get(id);
}

export function updateDebate(id: string, updates: Partial<Debate>): Debate | undefined {
  const debate = debates.get(id);
  if (!debate) return undefined;
  
  const updated = { ...debate, ...updates, updatedAt: new Date() };
  debates.set(id, updated);
  return updated;
}

export function deleteDebate(id: string): boolean {
  return debates.delete(id);
}

// Cleanup old debates periodically
function cleanupOldDebates(): void {
  const now = Date.now();
  for (const [id, debate] of debates) {
    if (now - debate.createdAt.getTime() > DEBATE_TTL_MS) {
      debates.delete(id);
    }
  }
}

// Run cleanup every hour
setInterval(cleanupOldDebates, 60 * 60 * 1000);

export function getDebateCount(): number {
  return debates.size;
}
```

**Step 2: Create simple test**

Create: `lib/store.test.ts`

```typescript
// lib/store.test.ts
import { createDebate, getDebate, updateDebate, deleteDebate } from './store';
import { Debate } from './types';

const mockDebate: Debate = {
  id: 'test-123',
  topic: 'Test topic',
  format: 'turn-based',
  maxTurns: 10,
  winningCondition: 'self-terminate',
  debaterA: { model: 'claude', name: 'Claude' },
  debaterB: { model: 'gpt-4', name: 'GPT-4' },
  turns: [],
  status: 'created',
  currentSpeaker: 'A',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('debate store', () => {
  beforeEach(() => {
    deleteDebate('test-123');
  });

  it('should create and retrieve a debate', () => {
    createDebate(mockDebate);
    const retrieved = getDebate('test-123');
    expect(retrieved).toEqual(mockDebate);
  });

  it('should update a debate', () => {
    createDebate(mockDebate);
    const updated = updateDebate('test-123', { status: 'running' });
    expect(updated?.status).toBe('running');
  });

  it('should return undefined for non-existent debate', () => {
    const retrieved = getDebate('non-existent');
    expect(retrieved).toBeUndefined();
  });
});
```

**Step 3: Run test**

```bash
npx jest lib/store.test.ts
```

Expected: Tests pass

**Step 4: Commit**

```bash
git add lib/store.ts lib/store.test.ts
git commit -m "feat: add in-memory debate store with TTL cleanup"
```

---

## Task 4: Create LLM Client with Streaming

**Files:**
- Create: `lib/llm.ts`

**Step 1: Implement LLM client**

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
  // Build conversation history
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
    
    // Simple reasoning detection: content between <reasoning> tags
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

// Test if debaters have reached agreement
export function checkForAgreement(content: string): boolean {
  const agreementPhrases = [
    'i agree',
    'i concede',
    "you're right",
    'you are right',
    'fair point',
    'i accept',
    'convincing argument',
    'i cannot disagree',
  ];
  
  const lower = content.toLowerCase();
  return agreementPhrases.some(phrase => lower.includes(phrase));
}

// Check for circular arguments
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
```

**Step 2: Commit**

```bash
git add lib/llm.ts
git commit -m "feat: add LLM client with streaming and reasoning filtering"
```

---

## Task 5: Create Debate API Routes

**Files:**
- Create: `app/api/debates/route.ts`
- Create: `app/api/debates/[id]/stream/route.ts`
- Create: `app/api/debates/[id]/action/route.ts`

**Step 1: Create POST /api/debates**

```typescript
// app/api/debates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createDebate, getDebate } from '@/lib/store';
import { Debate, DebaterConfig } from '@/lib/types';
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

    const debate: Debate = {
      id: nanoid(),
      topic,
      format: 'turn-based',
      maxTurns,
      winningCondition,
      debaterA: debaterA as DebaterConfig,
      debaterB: debaterB as DebaterConfig,
      turns: [],
      status: 'created',
      currentSpeaker: 'A',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    createDebate(debate);

    return NextResponse.json({ debate }, { status: 201 });
  } catch (error) {
    console.error('Error creating debate:', error);
    return NextResponse.json(
      { error: 'Failed to create debate' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return basic stats
  const { getDebateCount } = await import('@/lib/store');
  return NextResponse.json({ 
    status: 'ok',
    activeDebates: getDebateCount(),
  });
}
```

**Step 2: Install nanoid**

```bash
npm install nanoid
```

**Step 3: Create GET /api/debates/[id]/stream (SSE)**

```typescript
// app/api/debates/[id]/stream/route.ts
import { NextRequest } from 'next/server';
import { getDebate, updateDebate } from '@/lib/store';
import { streamDebateResponse, checkForAgreement, checkForCircularArgument } from '@/lib/llm';
import { Speaker, SSEEvent } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const debateId = params.id;
  const debate = getDebate(debateId);

  if (!debate) {
    return new Response('Debate not found', { status: 404 });
  }

  const encoder = new TextEncoder();
  let isClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: SSEEvent) => {
        if (!isClosed) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        }
      };

      try {
        // Send initial state
        send({ type: 'debate.started', debate });

        // Start debate if not already running
        if (debate.status === 'created') {
          updateDebate(debateId, { status: 'running' });
        }

        // Run debate loop
        while (!isClosed) {
          const currentDebate = getDebate(debateId);
          if (!currentDebate || currentDebate.status !== 'running') {
            break;
          }

          // Check if max turns reached
          if (currentDebate.turns.length >= currentDebate.maxTurns * 2) {
            send({
              type: 'debate.completed',
              winner: null,
              reason: 'Maximum turns reached without resolution',
            });
            updateDebate(debateId, { status: 'completed' });
            break;
          }

          const speaker = currentDebate.currentSpeaker;
          const debater = speaker === 'A' ? currentDebate.debaterA : currentDebate.debaterB;
          const opponent = speaker === 'A' ? currentDebate.debaterB : currentDebate.debaterA;

          // Start turn
          send({
            type: 'turn.started',
            speaker,
            turnNumber: Math.floor(currentDebate.turns.length / 2) + 1,
          });

          // Stream response
          let fullContent = '';
          let reasoning = '';

          const streamGenerator = streamDebateResponse(
            debater,
            currentDebate.topic,
            currentDebate.turns,
            opponent.objective
          );

          for await (const token of streamGenerator) {
            if (isClosed) break;
            fullContent += token;
            send({ type: 'token', speaker, content: token });
          }

          // Get final result
          const result = await streamGenerator.next();
          if (result.done && result.value) {
            fullContent = result.value.content;
            reasoning = result.value.reasoning || '';
          }

          // Record turn
          const turn = {
            number: currentDebate.turns.length + 1,
            speaker,
            content: fullContent,
            reasoning,
            timestamp: new Date(),
          };

          const updatedTurns = [...currentDebate.turns, turn];
          updateDebate(debateId, {
            turns: updatedTurns,
            currentSpeaker: speaker === 'A' ? 'B' : 'A',
          });

          send({ type: 'turn.completed', speaker, fullContent });

          // Check for agreement
          if (checkForAgreement(fullContent)) {
            send({
              type: 'debate.completed',
              winner: speaker === 'A' ? 'B' : 'A',
              reason: `${debater.name} conceded to ${opponent.name}`,
            });
            updateDebate(debateId, { status: 'completed', winner: speaker === 'A' ? 'B' : 'A' });
            break;
          }

          // Check for circular arguments
          if (checkForCircularArgument(updatedTurns)) {
            send({
              type: 'debate.completed',
              winner: 'draw',
              reason: 'Debaters reached a stalemate (circular arguments)',
            });
            updateDebate(debateId, { status: 'completed', winner: 'draw' });
            break;
          }

          // Small delay between turns for readability
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        controller.close();
      } catch (error) {
        console.error('Debate stream error:', error);
        send({ type: 'error', message: 'Debate stream error' });
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

**Step 4: Create POST /api/debates/[id]/action**

```typescript
// app/api/debates/[id]/action/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDebate, updateDebate } from '@/lib/store';
import { UserAction } from '@/lib/types';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const debateId = params.id;
    const debate = getDebate(debateId);

    if (!debate) {
      return NextResponse.json({ error: 'Debate not found' }, { status: 404 });
    }

    const action: UserAction = await req.json();

    switch (action.type) {
      case 'pause':
        updateDebate(debateId, { status: 'paused' });
        break;
      case 'resume':
        updateDebate(debateId, { status: 'running' });
        break;
      case 'skip':
        // Skip to next debater (handled by frontend reconnection)
        updateDebate(debateId, {
          currentSpeaker: debate.currentSpeaker === 'A' ? 'B' : 'A',
        });
        break;
      case 'inject':
        // Add user comment as a special turn
        if (action.payload) {
          updateDebate(debateId, {
            turns: [
              ...debate.turns,
              {
                number: debate.turns.length + 1,
                speaker: debate.currentSpeaker,
                content: `[User]: ${action.payload}`,
                timestamp: new Date(),
              },
            ],
          });
        }
        break;
      default:
        return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error('Action error:', error);
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
  }
}
```

**Step 5: Test API routes**

```bash
# Start dev server in background
npm run dev &

# Wait for server to start
sleep 5

# Test create debate
curl -X POST http://localhost:3000/api/debates \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Best sorting algorithm",
    "debaterA": {"model": "anthropic/claude-3.5-sonnet", "name": "Claude"},
    "debaterB": {"model": "openai/gpt-4", "name": "GPT-4"},
    "maxTurns": 3
  }'
```

Expected: JSON response with debate object and ID

**Step 6: Commit**

```bash
git add app/api/debates app/api/debates/[id]/stream app/api/debates/[id]/action
git commit -m "feat: add debate API routes (create, stream, action)"
```

---

## Task 6: Create Setup Page UI

**Files:**
- Modify: `app/page.tsx`

**Step 1: Replace page.tsx with setup form**

```tsx
// app/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { WinningCondition, DebaterConfig } from '@/lib/types';

const AVAILABLE_MODELS = [
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus' },
  { id: 'openai/gpt-4', name: 'GPT-4' },
  { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo' },
  { id: 'google/gemini-pro', name: 'Gemini Pro' },
  { id: 'meta-llama/llama-3-70b', name: 'Llama 3 70B' },
];

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [debaterA, setDebaterA] = useState<DebaterConfig>({
    model: 'anthropic/claude-3.5-sonnet',
    name: 'Claude',
  });
  const [debaterB, setDebaterB] = useState<DebaterConfig>({
    model: 'openai/gpt-4',
    name: 'GPT-4',
  });
  const [maxTurns, setMaxTurns] = useState(10);
  const [winningCondition, setWinningCondition] = useState<WinningCondition>('self-terminate');

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

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 text-zinc-100">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            🥊 LLM Debate Arena
          </h1>
          <p className="text-zinc-400 text-lg">
            Pit two AI models against each other in structured debates
          </p>
        </div>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl">Configure Debate</CardTitle>
            <CardDescription>
              Set up your AI debaters and the topic they&apos;ll argue about
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Topic */}
            <div className="space-y-2">
              <Label htmlFor="topic">Topic / Objective</Label>
              <Textarea
                id="topic"
                placeholder="e.g., What's the best algorithm for sorting 1 million integers?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-zinc-950 border-zinc-800 min-h-[100px]"
              />
            </div>

            <Separator className="bg-zinc-800" />

            {/* Debaters */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Debater A */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  <h3 className="font-semibold text-lg">Debater A</h3>
                </div>
                
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select
                    value={debaterA.model}
                    onValueChange={(value) => setDebaterA({ ...debaterA, model: value })}
                  >
                    <SelectTrigger className="bg-zinc-950 border-zinc-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      {AVAILABLE_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Custom Objective (optional)</Label>
                  <Input
                    placeholder="e.g., Argue for quicksort"
                    value={debaterA.objective || ''}
                    onChange={(e) => setDebaterA({ ...debaterA, objective: e.target.value })}
                    className="bg-zinc-950 border-zinc-800"
                  />
                </div>
              </div>

              {/* VS Badge */}
              <div className="hidden md:flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-bold text-xl">
                  VS
                </div>
              </div>

              {/* Debater B */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  <h3 className="font-semibold text-lg">Debater B</h3>
                </div>
                
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select
                    value={debaterB.model}
                    onValueChange={(value) => setDebaterB({ ...debaterB, model: value })}
                  >
                    <SelectTrigger className="bg-zinc-950 border-zinc-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      {AVAILABLE_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Custom Objective (optional)</Label>
                  <Input
                    placeholder="e.g., Argue for merge sort"
                    value={debaterB.objective || ''}
                    onChange={(e) => setDebaterB({ ...debaterB, objective: e.target.value })}
                    className="bg-zinc-950 border-zinc-800"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-zinc-800" />

            {/* Settings */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Turns</Label>
                <Input
                  type="number"
                  min={2}
                  max={50}
                  value={maxTurns}
                  onChange={(e) => setMaxTurns(parseInt(e.target.value) || 10)}
                  className="bg-zinc-950 border-zinc-800"
                />
              </div>

              <div className="space-y-2">
                <Label>Winning Condition</Label>
                <Select
                  value={winningCondition}
                  onValueChange={(value) => setWinningCondition(value as WinningCondition)}
                >
                  <SelectTrigger className="bg-zinc-950 border-zinc-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="self-terminate">Self-Terminate (concession)</SelectItem>
                    <SelectItem value="user-decides">User Decides</SelectItem>
                    <SelectItem value="ai-judge">AI Judge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Start Button */}
            <Button
              onClick={handleStartDebate}
              disabled={!topic.trim() || isLoading}
              className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              {isLoading ? 'Starting...' : '🚀 Start Debate'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
```

**Step 2: Test the page**

```bash
# Navigate to http://localhost:3000
# Fill in the form
# Click Start Debate
```

Expected: Page loads, form works, redirects to /debate/[id]

**Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add debate setup page with form"
```

---

## Task 7: Create Debate View Page

**Files:**
- Create: `app/debate/[id]/page.tsx`

**Step 1: Implement debate view**

```tsx
// app/debate/[id]/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Debate, Turn, Speaker, SSEEvent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Pause, Play, SkipForward, MessageSquare, Trophy } from 'lucide-react';

export default function DebatePage() {
  const params = useParams();
  const debateId = params.id as string;
  
  const [debate, setDebate] = useState<Debate | null>(null);
  const [currentTurn, setCurrentTurn] = useState<Turn | null>(null);
  const [streamingContent, setStreamingContent] = useState<Record<Speaker, string>>({ A: '', B: '' });
  const [isPaused, setIsPaused] = useState(false);
  const [winner, setWinner] = useState<Speaker | 'draw' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const connectToStream = () => {
      const eventSource = new EventSource(`/api/debates/${debateId}/stream`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      eventSource.onmessage = (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data);
          handleEvent(data);
        } catch (err) {
          console.error('Failed to parse event:', err);
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
        setError('Connection lost. Attempting to reconnect...');
        eventSource.close();
        
        // Reconnect after 3 seconds
        setTimeout(connectToStream, 3000);
      };
    };

    connectToStream();

    return () => {
      eventSourceRef.current?.close();
    };
  }, [debateId]);

  const handleEvent = (event: SSEEvent) => {
    switch (event.type) {
      case 'debate.started':
        setDebate(event.debate);
        break;
      case 'turn.started':
        setCurrentTurn({
          number: event.turnNumber,
          speaker: event.speaker,
          content: '',
          timestamp: new Date(),
        });
        setStreamingContent(prev => ({ ...prev, [event.speaker]: '' }));
        break;
      case 'token':
        setStreamingContent(prev => ({
          ...prev,
          [event.speaker]: prev[event.speaker] + event.content,
        }));
        break;
      case 'turn.completed':
        setDebate(prev => {
          if (!prev) return null;
          return {
            ...prev,
            turns: [...prev.turns, {
              number: prev.turns.length + 1,
              speaker: event.speaker,
              content: event.fullContent,
              timestamp: new Date(),
            }],
            currentSpeaker: event.speaker === 'A' ? 'B' : 'A',
          };
        });
        setStreamingContent(prev => ({ ...prev, [event.speaker]: '' }));
        break;
      case 'debate.completed':
        setWinner(event.winner);
        setDebate(prev => prev ? { ...prev, status: 'completed' } : null);
        break;
      case 'error':
        setError(event.message);
        break;
    }
  };

  const handleAction = async (action: 'pause' | 'resume' | 'skip') => {
    try {
      const response = await fetch(`/api/debates/${debateId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: action }),
      });

      if (!response.ok) throw new Error('Action failed');

      if (action === 'pause') setIsPaused(true);
      if (action === 'resume') setIsPaused(false);
    } catch (err) {
      console.error('Action error:', err);
    }
  };

  if (!debate) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Loading debate...</div>
      </div>
    );
  }

  const getDebaterInfo = (speaker: Speaker) => {
    return speaker === 'A' ? debate.debaterA : debate.debaterB;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{debate.topic}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? 'Live' : 'Reconnecting...'}
              </Badge>
              <span className="text-sm text-zinc-400">
                {getDebaterInfo('A').name} vs {getDebaterInfo('B').name}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction(isPaused ? 'resume' : 'pause')}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('skip')}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-900/50 border border-red-800 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Winner Banner */}
        {winner && (
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 px-8 py-4 rounded-2xl">
              <Trophy className="w-8 h-8" />
              <div className="text-left">
                <div className="text-sm opacity-80">Winner</div>
                <div className="text-2xl font-bold">
                  {winner === 'draw' ? 'Draw' : getDebaterInfo(winner).name}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Debate Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {(['A', 'B'] as Speaker[]).map((speaker) => {
            const debater = getDebaterInfo(speaker);
            const isCurrentSpeaker = debate.currentSpeaker === speaker && debate.status === 'running';
            const isTyping = isCurrentSpeaker && streamingContent[speaker];
            
            return (
              <Card 
                key={speaker}
                className={`bg-zinc-900/50 border-zinc-800 ${
                  isCurrentSpeaker ? 'ring-2 ring-orange-500' : ''
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🤖</span>
                    {debater.name}
                    {isCurrentSpeaker && (
                      <Badge variant="secondary" className="animate-pulse">
                        Speaking...
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isTyping ? (
                    <div className="prose prose-invert max-w-none">
                      <p className="whitespace-pre-wrap">{streamingContent[speaker]}</p>
                      <span className="inline-block w-2 h-4 bg-orange-500 animate-pulse ml-1" />
                    </div>
                  ) : (
                    <p className="text-zinc-500 italic">
                      {isCurrentSpeaker ? 'Thinking...' : 'Waiting...'}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Separator className="bg-zinc-800 my-8" />

        {/* Debate Log */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Debate Log</h2>
          <div className="space-y-4">
            {debate.turns.map((turn) => (
              <Card key={turn.number} className="bg-zinc-900/30 border-zinc-800">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Badge variant="outline">Turn {turn.number}</Badge>
                    <div className="flex-1">
                      <div className="font-semibold text-orange-400 mb-2">
                        {getDebaterInfo(turn.speaker).name}
                      </div>
                      <p className="text-zinc-300 whitespace-pre-wrap">{turn.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
```

**Step 2: Test the debate view**

```bash
# Create a debate from the home page
# Watch it stream live
# Test pause/skip buttons
```

Expected: Real-time streaming debate, controls work, winner displays

**Step 3: Commit**

```bash
git add app/debate/[id]/page.tsx
git commit -m "feat: add live debate view with SSE streaming"
```

---

## Task 8: Add Configuration and Polish

**Files:**
- Create: `lib/config.ts`
- Modify: `next.config.js`
- Modify: `tailwind.config.ts`

**Step 1: Create config file**

```typescript
// lib/config.ts
export const CONFIG = {
  // API timeouts
  TURN_TIMEOUT_MS: 30000,
  MAX_TURNS_DEFAULT: 10,
  MAX_TURNS_LIMIT: 50,
  
  // Debate detection
  AGREEMENT_PHRASES: [
    'i agree',
    'i concede',
    "you're right",
    'you are right',
    'fair point',
    'i accept',
    'convincing argument',
    'i cannot disagree',
  ],
  
  // Storage
  DEBATE_TTL_HOURS: 24,
  CLEANUP_INTERVAL_HOURS: 1,
  
  // Models available through OpenRouter
  DEFAULT_MODELS: [
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
    { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus' },
    { id: 'openai/gpt-4', name: 'GPT-4' },
    { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo' },
    { id: 'google/gemini-pro', name: 'Gemini Pro' },
    { id: 'meta-llama/llama-3-70b', name: 'Llama 3 70B' },
  ],
} as const;
```

**Step 2: Update next.config.js for static export (optional)**

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Uncomment for static export
  // output: 'export',
  // distDir: 'dist',
};

module.exports = nextConfig;
```

**Step 3: Ensure tailwind has proper config**

Verify `tailwind.config.ts` includes:

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ... existing config
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

**Step 4: Add README**

Create: `README.md`

```markdown
# LLM Debate Arena

A web application that allows users to pit two LLMs against each other in structured debates.

## Features

- **Real-time debates**: Watch two AI models argue in real-time via Server-Sent Events
- **Multiple models**: Support for Claude, GPT-4, Gemini, and more via OpenRouter
- **User controls**: Pause, skip, or inject comments during debates
- **Filtered reasoning**: LLMs see only public responses, not each other's reasoning
- **Configurable**: Custom objectives per debater, multiple winning conditions

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.local.example` to `.env.local` and add your OpenRouter API key:
   ```bash
   cp .env.local.example .env.local
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

- `OPENROUTER_API_KEY` - Your OpenRouter API key (get one at openrouter.ai)

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- OpenRouter API

## License

MIT
```

**Step 5: Final commit**

```bash
git add lib/config.ts next.config.js README.md
git commit -m "chore: add configuration, README, and polish"
```

---

## Testing Checklist

Before considering MVP complete, verify:

- [ ] Create debate form works
- [ ] Debate streams in real-time
- [ ] Both LLMs take turns
- [ ] Pause/resume works
- [ ] Skip turn works
- [ ] Winner detected on concession
- [ ] Debate ends at max turns
- [ ] Reconnection works if browser refreshes
- [ ] Mobile layout is usable
- [ ] Error states handled gracefully

---

## Future Enhancements

1. **Persistence**: Redis/DB storage for completed debates
2. **History**: View past debates, share links
3. **Multi-provider**: Direct Anthropic/OpenAI integration
4. **AI Judge**: Third LLM evaluates and scores debates
5. **Voting**: Community voting on debate winners
6. **Templates**: Pre-built debate scenarios
7. **Export**: PDF/markdown export of debates
8. **Analytics**: Win rates by model, popular topics

---

**Plan complete and saved to `docs/plans/2025-02-15-llm-debate-arena-implementation.md`.**

## Two Execution Options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
