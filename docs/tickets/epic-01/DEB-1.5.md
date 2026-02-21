---
id: DEB-1.5
title: Setup Convex Database
ePic: Project Setup & Foundation
priority: P0
status: TODO
points: 3
assignee: TBD
labels: [setup, convex, database]
---

## Description
Initialize Convex backend and configure it for the debate application.

## Acceptance Criteria
- [ ] Run `npx convex dev` to initialize
- [ ] Configure `convex.json` with proper settings
- [ ] Setup development environment connection
- [ ] Verify connection to Convex cloud

## Files Created
- `convex/` directory structure
- `convex.json`

## Definition of Done
- [ ] `npx convex dev` connects successfully
- [ ] Dashboard accessible at convex.dev

## Notes
**Commands to run:**
```bash
npx convex dev
```

## Dependencies
- DEB-1.1 (Project initialized)
- DEB-1.3 (Dependencies installed)
- DEB-1.4 (Environment configured)

## Blocks
2.2, 3.1, 3.2, 3.3
