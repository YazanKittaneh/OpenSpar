# Model Chooser Reasoning + Search Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a searchable hybrid model chooser and per-side runtime reasoning toggles to the debate setup flow.

**Architecture:** A local models API route fetches and normalizes OpenRouter model metadata, while the setup page merges it with curated defaults and renders a searchable picker component. Debater config gains an optional `reasoningEnabled` field that is persisted through Convex and translated into OpenRouter request parameters in `lib/llm.ts`.

**Tech Stack:** Next.js App Router, React, TypeScript, Convex, OpenAI SDK (OpenRouter-compatible)

---

### Task 1: Model Catalog Domain Logic

**Files:**
- Create: `lib/models.ts`
- Modify: `lib/config.ts`
- Test: `lib/models.test.ts`

**Step 1: Write the failing test**
- Add tests for OpenRouter payload normalization (`supported_parameters` -> reasoning flags) and merge/dedupe behavior (curated entries win by id).

**Step 2: Run test to verify it fails**
Run: `npx vitest run lib/models.test.ts`
Expected: FAIL because `lib/models.ts` does not exist.

**Step 3: Write minimal implementation**
- Add model entry types, normalization helpers, provider extraction, capability detection, and merge function.
- Expand curated `DEFAULT_MODELS` entries with provider/capability metadata.

**Step 4: Run test to verify it passes**
Run: `npx vitest run lib/models.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add lib/models.ts lib/models.test.ts lib/config.ts
git commit -m "feat: add model catalog normalization"
```

### Task 2: Models API Route

**Files:**
- Create: `app/api/models/route.ts`
- Modify: `lib/models.ts`

**Step 1: Write the failing test**
- (Optional lightweight) Add a normalization unit test case for malformed OpenRouter payload rows.

**Step 2: Run test to verify it fails**
Run: `npx vitest run lib/models.test.ts`
Expected: FAIL on malformed-row handling assertion.

**Step 3: Write minimal implementation**
- Implement `/api/models` route that fetches OpenRouter catalog, normalizes entries, and returns `{ models: [...] }`.
- Return fallback error JSON on non-OK upstream responses.

**Step 4: Run test to verify it passes**
Run: `npx vitest run lib/models.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add app/api/models/route.ts lib/models.ts lib/models.test.ts
git commit -m "feat: add models catalog api route"
```

### Task 3: Searchable Model Picker UI

**Files:**
- Create: `components/model-picker.tsx`
- Modify: `app/page.tsx`

**Step 1: Write the failing test**
- Skip UI test if no existing React test harness; validate via manual dev run in later task.

**Step 2: Run test to verify it fails**
- N/A (manual verification-driven for UI component in this repo state).

**Step 3: Write minimal implementation**
- Build reusable searchable picker with grouped curated/all-model sections and capability badges.
- Load `/api/models` in setup page and merge with curated defaults.
- Replace both model `Select`s with `ModelPicker`.

**Step 4: Run verification**
Run: `npm run lint`
Expected: PASS (or report existing unrelated lint failures)

**Step 5: Commit**
```bash
git add components/model-picker.tsx app/page.tsx
git commit -m "feat: add searchable model picker"
```

### Task 4: Per-Side Reasoning Toggle Persistence + Runtime Support

**Files:**
- Modify: `lib/types.ts`
- Modify: `app/page.tsx`
- Modify: `app/api/debates/route.ts`
- Modify: `convex/schema.ts`
- Modify: `convex/debates.ts`
- Modify: `lib/llm.ts`
- Test: `lib/llm.test.ts`

**Step 1: Write the failing test**
- Add `lib/llm.test.ts` coverage for reasoning request-body inclusion logic.

**Step 2: Run test to verify it fails**
Run: `npx vitest run lib/llm.test.ts`
Expected: FAIL until request builder/helper exists.

**Step 3: Write minimal implementation**
- Add optional `reasoningEnabled` field to debater types and Convex validators.
- Add per-side UI toggle with disabled state when unsupported.
- Include OpenRouter `reasoning` parameter in chat request when enabled and toggleable.

**Step 4: Run test to verify it passes**
Run: `npx vitest run lib/llm.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add lib/types.ts app/page.tsx app/api/debates/route.ts convex/schema.ts convex/debates.ts lib/llm.ts lib/llm.test.ts
git commit -m "feat: add per-side reasoning toggle"
```

### Task 5: Integration Verification

**Files:**
- Modify: generated Convex artifacts as needed (`convex/_generated/*` via codegen)

**Step 1: Run Convex codegen**
Run: `npx convex codegen`
Expected: Generated types update successfully.

**Step 2: Run focused test suite**
Run: `npx vitest run lib/models.test.ts lib/llm.test.ts`
Expected: PASS

**Step 3: Run lint**
Run: `npm run lint`
Expected: PASS (or document any pre-existing issues)

**Step 4: Manual smoke check**
Run: `npm run dev`
Expected: Setup page loads, searchable picker works, reasoning toggle enables/disables per model.

**Step 5: Commit**
```bash
git add convex/_generated docs/plans
git commit -m "docs: add model chooser reasoning search plan"
```
