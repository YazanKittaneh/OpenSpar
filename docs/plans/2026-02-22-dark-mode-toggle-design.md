# Dark Mode Toggle Design

## Context
The app uses `next-themes` with class-based theming. The toggle updates theme state, but visual theme did not change.

## Problem
In `/Users/yazankittaneh/code/Projects/debate/app/globals.css`, `:root` (light tokens) is declared after `.dark` with equal specificity. That causes light tokens to win in the cascade, so toggling dark class has no visible effect.

## Options Considered
1. Reorder token blocks so `:root` comes before `.dark`.
2. Increase dark selector specificity to `:root.dark`.
3. Switch to data-attribute selectors.

## Decision
Use option 1 because it is the smallest, lowest-risk fix and keeps the existing theme architecture unchanged.

## Approved Scope
- Keep `next-themes` class mode.
- Set default theme to light.
- Ensure `.dark` token block overrides light tokens when active.
- Validate with lint and manual toggle check.
