---
id: DEB-1.2
title: Install shadcn/ui Components
ePic: Project Setup & Foundation
priority: P0
status: TODO
points: 2
assignee: TBD
labels: [setup, shadcn, ui]
---

## Description
Install all required shadcn/ui components for the debate UI.

## Acceptance Criteria
- [ ] Install components: `button`, `card`, `select`, `textarea`, `badge`, `separator`, `input`, `label`
- [ ] All components render without errors
- [ ] Dark theme configured

## Files Modified
- `components/ui/*`

## Definition of Done
- [ ] All UI components can be imported and rendered
- [ ] Dark mode styling applied

## Notes
**Command to run:**
```bash
npx shadcn add button card select textarea badge separator input label
```

## Dependencies
- DEB-1.1 (Project initialized)

## Blocks
7.2, 8.1
