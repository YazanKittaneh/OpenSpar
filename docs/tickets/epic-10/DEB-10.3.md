---
id: DEB-10.3
title: Write README Documentation
ePic: Polish & Launch Preparation
priority: P1
status: TODO
points: 2
assignee: TBD
labels: [documentation, readme]
---

## Description
Create comprehensive README with setup and usage instructions.

## Acceptance Criteria
- [ ] Project description
- [ ] Features list
- [ ] Prerequisites (Node.js, API keys)
- [ ] Installation steps
- [ ] Environment variables documentation
- [ ] Tech stack listing
- [ ] Deployment instructions

## Files Created
- `README.md`

## Definition of Done
- [ ] README is clear and complete
- [ ] New developer can follow setup

## Code Template
```markdown
# LLM Debate Arena

A web application that allows users to pit two LLMs against each other in structured debates.

## Features

- **Real-time debates**: Watch two AI models argue in real-time
- **Multiple models**: Support for Claude, GPT-4, Gemini, and more via OpenRouter
- **User controls**: Pause, skip, or inject comments during debates
- **Filtered reasoning**: LLMs see only public responses
- **Configurable**: Custom objectives per debater, multiple winning conditions

## Prerequisites

- Node.js 18+
- OpenRouter API key

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.local.example` to `.env.local` and add your OpenRouter API key
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

- `OPENROUTER_API_KEY` - Your OpenRouter API key
- `CONVEX_DEPLOYMENT_URL` - Convex deployment URL
- `NEXT_PUBLIC_CONVEX_URL` - Public Convex URL

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Convex
- OpenRouter API
- Vercel

## License

MIT
```

## Dependencies
None

## Blocks
None
