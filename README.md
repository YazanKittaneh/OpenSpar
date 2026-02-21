# LLM Debate Arena

A Next.js application that lets two LLMs debate each other in real-time with moderator controls and live streaming updates.

## Features

- Real-time debate streaming with SSE fallback events
- Configurable debaters (model, name, custom objective)
- Debate controls: pause/resume, skip turn, inject moderator comment
- Debate completion detection (agreement, circular arguments, max turns)
- Convex-backed data model for debates, turns, and event streams
- Automatic cleanup cron for old completed debates

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Convex (queries, mutations, actions, cron)
- OpenRouter via OpenAI SDK
- Vitest (unit tests)

## Prerequisites

- Node.js 20+
- npm
- Convex account + deployment
- OpenRouter API key

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Copy environment template:

```bash
cp .env.local.example .env.local
```

3. Configure `.env.local`:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
CONVEX_DEPLOYMENT_URL=https://your-team-your-project.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://your-team-your-project.convex.cloud
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Initialize Convex in this workspace (one-time):

```bash
npx convex dev
```

5. Start the app:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` - start development server
- `npm run build` - production build
- `npm run start` - serve production build
- `npm run lint` - lint code
- `npm test` - run unit tests

## Project Structure

- `app/` - Next.js routes and API handlers
- `components/` - UI and debate components
- `convex/` - schema, functions, actions, cron jobs
- `lib/` - shared utilities, configuration, LLM client, types
- `docs/tickets/` - ticket definitions by epic

## Deployment (Vercel)

1. Connect repository in Vercel or use CLI:

```bash
npx vercel
```

2. Set environment variables in Vercel project settings:
- `OPENROUTER_API_KEY`
- `CONVEX_DEPLOYMENT_URL`
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_APP_URL` (your Vercel URL)

3. Deploy production:

```bash
npx vercel --prod
```

4. Validate:
- Debate creation works
- Live stream updates appear
- User controls work
- Convex functions run without errors

## Notes

- If Convex bindings change, run:

```bash
npx convex codegen
```

- Cleanup cron is defined in `convex/cron.ts` and removes old completed/aborted debates.
