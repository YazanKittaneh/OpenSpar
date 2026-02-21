# Ticket Execution Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the LLM Debate Arena by implementing all current tickets in dependency-first order with working foundations, Convex data layer, LLM integration, and API routes.

**Architecture:** Next.js App Router frontend + Convex backend for storage/realtime + OpenRouter via OpenAI SDK for debate generation. Convex subscriptions are primary realtime mechanism; SSE route is implemented as backup endpoint per ticket.

**Tech Stack:** Next.js 14+, TypeScript, Tailwind/shadcn/ui, Convex, OpenAI SDK, Vercel config.

---

## Dependency-First Execution Order

1. DEB-1.1 initialize Next.js project
2. DEB-1.2 install shadcn components
3. DEB-1.3 install dependencies
4. DEB-1.4 environment template + validation
5. DEB-1.6 Vercel/Next config
6. DEB-2.1 core types
7. DEB-1.5 Convex setup (requires env values from user; proceed with scaffold and note runtime requirement)
8. DEB-2.2 Convex schema
9. DEB-3.1 queries
10. DEB-3.2 mutations
11. DEB-3.3 subscriptions
12. DEB-4.1 LLM client streaming
13. DEB-4.2 prompt builder
14. DEB-4.3 debate intelligence
15. DEB-5.1 orchestrator
16. DEB-5.2 user action handling
17. DEB-6.1 debates API routes
18. DEB-6.3 action API route
19. DEB-6.2 SSE backup route

## Constraints / Clarifications

- Missing secret values (OpenRouter/Convex URLs) are handled via `.env.local.example`; `.env.local` will be created with placeholders if absent.
- Tickets reference some older route assumptions; actual implementation will use Convex HTTP client/server APIs rather than raw fetching Convex site URLs.
- If any ticket is ambiguous at implementation time, pause and request replanning.
