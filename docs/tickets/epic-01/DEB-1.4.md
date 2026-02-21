---
id: DEB-1.4
title: Configure Environment Variables
ePic: Project Setup & Foundation
priority: P0
status: TODO
points: 1
assignee: TBD
labels: [setup, config]
---

## Description
Set up environment files with required API keys and configuration.

## Acceptance Criteria
- [ ] Create `.env.local` with:
  - `OPENROUTER_API_KEY`
  - `CONVEX_DEPLOYMENT_URL`
  - `NEXT_PUBLIC_CONVEX_URL`
- [ ] Create `.env.local.example` as template
- [ ] Add environment validation

## Files Created
- `.env.local`
- `.env.local.example`

## Definition of Done
- [ ] Environment variables documented
- [ ] App reads config without errors

## Notes
**Required variables:**
```bash
OPENROUTER_API_KEY=your_key_here
CONVEX_DEPLOYMENT_URL=your_deployment_url
NEXT_PUBLIC_CONVEX_URL=your_public_url
```

## Dependencies
- DEB-1.1 (Project initialized)
- DEB-1.3 (Dependencies installed)

## Blocks
1.5, 4.1, 5.1
