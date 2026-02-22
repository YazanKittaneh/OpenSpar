# Optional Accounts + Saved API Keys Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add optional Convex Auth accounts and encrypted per-user API key persistence while keeping anonymous debates supported.

**Architecture:** Integrate Convex Auth in both Convex backend and Next.js app shell, add account-key CRUD route handlers with server-side encryption, and update debate create/resume routes to resolve API keys from request or saved account state.

**Tech Stack:** Next.js 16, Convex, Convex Auth, TypeScript, Node crypto (AES-256-GCM).

---

### Task 1: Add Convex Auth backend plumbing

**Files:**
- Create: `/Users/yazankittaneh/code/Projects/debate/convex/auth.ts`
- Create: `/Users/yazankittaneh/code/Projects/debate/convex/auth.config.ts`
- Create: `/Users/yazankittaneh/code/Projects/debate/convex/http.ts`
- Modify: `/Users/yazankittaneh/code/Projects/debate/convex/schema.ts`

**Step 1:** Configure Convex Auth exports (`auth`, `signIn`, `signOut`, `isAuthenticated`) using Password provider.

**Step 2:** Add auth HTTP routes via `auth.addHttpRoutes(http)`.

**Step 3:** Merge `authTables` into schema and define `userApiKeys` table.

**Step 4:** Regenerate bindings with `CONVEX_DEPLOYMENT=dev:rapid-lyrebird-952 npx convex codegen`.

### Task 2: Add key persistence + encryption services

**Files:**
- Create: `/Users/yazankittaneh/code/Projects/debate/convex/userApiKeys.ts`
- Create: `/Users/yazankittaneh/code/Projects/debate/lib/api-key-crypto.ts`
- Create: `/Users/yazankittaneh/code/Projects/debate/app/api/account/api-key/route.ts`

**Step 1:** Implement authenticated Convex mutations/queries for save/get/delete key records by `userId`.

**Step 2:** Implement AES-256-GCM encrypt/decrypt helpers with required `API_KEY_ENCRYPTION_SECRET`.

**Step 3:** Implement authenticated REST endpoints for saving, fetching masked key metadata, and deleting key.

### Task 3: Integrate auth in Next app + debate flows

**Files:**
- Create: `/Users/yazankittaneh/code/Projects/debate/components/convex-client-provider.tsx`
- Create: `/Users/yazankittaneh/code/Projects/debate/middleware.ts`
- Modify: `/Users/yazankittaneh/code/Projects/debate/app/layout.tsx`
- Modify: `/Users/yazankittaneh/code/Projects/debate/app/page.tsx`
- Modify: `/Users/yazankittaneh/code/Projects/debate/app/api/debates/route.ts`
- Modify: `/Users/yazankittaneh/code/Projects/debate/app/api/debates/[id]/action/route.ts`
- Modify: `/Users/yazankittaneh/code/Projects/debate/app/debate/[id]/page.tsx`
- Modify: `/Users/yazankittaneh/code/Projects/debate/lib/convex.ts`

**Step 1:** Wrap app with Convex Auth server/client providers.

**Step 2:** Add optional account UX (sign up/sign in/sign out) and saved-key controls on setup screen.

**Step 3:** Change debate create route to use request key or saved account key fallback.

**Step 4:** Change resume action route to strip non-schema fields before mutation and fallback to saved account key.

**Step 5:** Remove mandatory prompt-on-resume behavior in debate page.

### Task 4: Validate and deliver

**Files:**
- Modify: `/Users/yazankittaneh/code/Projects/debate/.env.local.example`
- Modify: `/Users/yazankittaneh/code/Projects/debate/docs/plans/2026-02-22-optional-accounts-design.md`
- Modify: `/Users/yazankittaneh/code/Projects/debate/docs/plans/2026-02-22-optional-accounts-implementation.md`

**Step 1:** Document encryption env variable in `.env.local.example`.

**Step 2:** Run `npm run lint`, `npm test`, `npm run build`.

**Step 3:** Commit all changes and push branch.
