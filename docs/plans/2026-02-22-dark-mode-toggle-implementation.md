# Dark Mode Toggle Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the theme toggle visibly switch between light and dark modes and default to light mode.

**Architecture:** Preserve the existing `next-themes` class strategy. Fix CSS cascade so theme tokens apply correctly by ordering light defaults before dark overrides, then set provider default theme to light.

**Tech Stack:** Next.js 16, React 19, next-themes, Tailwind CSS v4.

---

### Task 1: Fix CSS theme token cascade

**Files:**
- Modify: `/Users/yazankittaneh/code/Projects/debate/app/globals.css`

**Step 1: Inspect theme variable blocks**
Run: `nl -ba app/globals.css | sed -n '55,145p'`
Expected: `.dark` block appears before `:root`.

**Step 2: Reorder blocks**
Move the `:root` light token block above `.dark` so dark overrides win when class is set.

**Step 3: Verify order after edit**
Run: `nl -ba app/globals.css | sed -n '55,145p'`
Expected: `:root` appears first, `.dark` after it.

**Step 4: Commit this task**
Run:
```bash
git add app/globals.css
git commit -m "fix: correct theme token cascade for dark mode"
```

### Task 2: Default to light mode

**Files:**
- Modify: `/Users/yazankittaneh/code/Projects/debate/components/theme-provider.tsx`

**Step 1: Update provider default**
Change `defaultTheme="dark"` to `defaultTheme="light"`.

**Step 2: Validate lint**
Run: `npm run lint`
Expected: ESLint completes without errors.

**Step 3: Commit this task**
Run:
```bash
git add components/theme-provider.tsx
git commit -m "fix: default app theme to light"
```

### Task 3: Final verification and single delivery commit

**Files:**
- Modify: `/Users/yazankittaneh/code/Projects/debate/docs/plans/2026-02-22-dark-mode-toggle-design.md`
- Modify: `/Users/yazankittaneh/code/Projects/debate/docs/plans/2026-02-22-dark-mode-toggle-implementation.md`

**Step 1: Verify changed files**
Run: `git status --short`
Expected: only expected files are modified.

**Step 2: Create final commit for delivery**
Run:
```bash
git add app/globals.css components/theme-provider.tsx docs/plans/2026-02-22-dark-mode-toggle-design.md docs/plans/2026-02-22-dark-mode-toggle-implementation.md
git commit -m "fix: repair theme toggle and default to light"
```

**Step 3: Push branch**
Run: `git push origin main`
Expected: remote updated successfully.
