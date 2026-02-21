# LLM Debate Arena - Sprint Board

**Project:** LLM Debate Arena  
**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, OpenRouter API, Convex (DB), Vercel (Hosting)  
**Architecture:** Server-Sent Events (SSE) with async turn orchestration  

---

## Epic 1: Project Setup & Foundation
*Setup the Next.js project with all required dependencies and tooling*

### Story 1.1: Initialize Next.js Project with shadcn/ui
**Priority:** P0 | **Status:** 🔴 TODO  
**Points:** 3

**Description:**  
Bootstrap the Next.js project with shadcn/ui template and configure all base settings.

**Acceptance Criteria:**
- [ ] Project scaffolded with `npx shadcn@latest init --yes --template next --base-color zinc`
- [ ] TypeScript configured properly
- [ ] Tailwind CSS working
- [ ] Development server runs on `localhost:3000`

**Files Created:**
- Entire project structure

**Definition of Done:**
- `npm run dev` starts without errors
- Homepage loads at `http://localhost:3000`

---

### Story 1.2: Install shadcn/ui Components
**Priority:** P0 | **Status:** 🔴 TODO  
**Points:** 2

**Description:**  
Install all required shadcn/ui components for the debate UI.

**Acceptance Criteria:**
- [ ] Install components: `button`, `card`, `select`, `textarea`, `badge`, `separator`, `input`, `label`
- [ ] All components render without errors
- [ ] Dark theme configured

**Files Modified:**
- `components/ui/*`

**Definition of Done:**
- All UI components can be imported and rendered
- Dark mode styling applied

---

### Story 1.3: Install Additional Dependencies
**Priority:** P0 | **Status:** 🔴 TODO  
**Points:** 2

**Description:**  
Install AI SDK, OpenRouter client, Convex SDK, and other required packages.

**Acceptance Criteria:**
- [ ] Install `ai` package
- [ ] Install `openai` package (for OpenRouter compatibility)
- [ ] Install `convex` package
- [ ] Install `nanoid` for ID generation
- [ ] Install `lucide-react` for icons

**Files Modified:**
- `package.json`
- `package-lock.json`

**Definition of Done:**
- All packages installed without conflicts
- `npm run build` succeeds

---

### Story 1.4: Configure Environment Variables
**Priority:** P0 | **Status:** 🔴 TODO  
**Points:** 1

**Description:**  
Set up environment files with required API keys and configuration.

**Acceptance Criteria:**
- [ ] Create `.env.local` with:
  - `OPENROUTER_API_KEY`
  - `CONVEX_DEPLOYMENT_URL`
  - `NEXT_PUBLIC_CONVEX_URL`
- [ ] Create `.env.local.example` as template
- [ ] Add environment validation

**Files Created:**
- `.env.local`
- `.env.local.example`

**Definition of Done:**
- Environment variables documented
- App reads config without errors

---

### Story 1.5: Setup Convex Database
**Priority:** P0 | **Status:** 🔴 TODO  
**Points:** 3

**Description:**  
Initialize Convex backend and configure it for the debate application.

**Acceptance Criteria:**
- [ ] Run `npx convex dev` to initialize
- [ ] Configure `convex.json` with proper settings
- [ ] Setup development environment connection
- [ ] Verify connection to Convex cloud

**Files Created:**
- `convex/` directory structure
- `convex.json`

**Definition of Done:**
- `npx convex dev` connects successfully
- Dashboard accessible at convex.dev

---

### Story 1.6: Configure Next.js for Vercel Deployment
**Priority:** P1 | **Status:** 🔴 TODO  
**Points:** 2

**Description:**  
Configure Next.js for optimal Vercel deployment with proper settings for SSE and API routes.

**Acceptance Criteria:**
- [ ] Configure `next.config.js` with proper headers for SSE
- [ ] Setup build optimization
- [ ] Configure static/dynamic route handling
- [ ] Add Vercel deployment configuration

**Files Modified:**
- `next.config.js`
- `vercel.json` (if needed)

**Definition of Done:**
- Build succeeds with `npm run build`
- Ready for Vercel deployment

---

## Epic 2: Type System & Core Types
*Define TypeScript types for the entire debate system*

### Story 2.1: Define Core Debate Types
**Priority:** P0 | **Status:** 🔴 TODO  
**Points:** 3

**Description:**  
Create comprehensive TypeScript types for debates, turns, speakers, and events.

**Acceptance Criteria:**
- [ ] Create `DebateStatus` type: `'created' | 'running' | 'paused' | 'completed' | 'aborted'`
- [ ] Create `WinningCondition` type: `'self-terminate' | 'user-decides' | 'ai-judge'`
- [ ] Create `Speaker` type: `'A' | 'B'`
- [ ] Create `DebaterConfig` interface with model, name, systemPrompt, objective
- [ ] Create `Turn` interface with number, speaker, content, reasoning, timestamp
- [ ] Create `Debate` interface with all required fields
- [ ] Create `UserAction` and `UserActionType` types
- [ ] Create `SSEEvent` union type for all event types

**Files Created:**
- `lib/types.ts`

**Definition of Done:**
- All types compile with `npx tsc --noEmit`
- Types are comprehensive and type-safe

---

### Story 2.2: Define Convex Schema
**Priority:** P0 | **Status:** 🔴 TODO  
**Points:** 3

**Description:**  
Define the Convex database schema for storing debates, turns, and user actions.

**Acceptance Criteria:**
- [ ] Create `convex/schema.ts` with debate table
- [ ] Define schema for `debates` table matching TypeScript types
- [ ] Define schema for `turns` table
- [ ] Add proper indexes for efficient queries
- [ ] Configure validation rules

**Files Created:**
- `convex/schema.ts`

**Definition of Done:**
- Schema pushes to Convex without errors
- Types align with TypeScript definitions

---

## Epic 3: Convex Data Layer
*Implement Convex queries, mutations, and real-time subscriptions*

### Story 3.1: Create Debate Queries
**Priority:** P0 | **Status:** 🔴 TODO  
**Points:** 3

**Description:**  
Implement Convex queries for retrieving debates and related data.

**Acceptance Criteria:**
- [ ] Create `getDebate` query - fetch single debate by ID
- [ ] Create `getActiveDebates` query - list running debates
- [ ] Create `getDebateTurns` query - fetch turns for a debate
- [ ] Add pagination support for turns
- [ ] Implement proper authorization (if needed)

**Files Created:**
- `convex/debates.ts`
- `convex/turns.ts`

**Definition of Done:**
- Queries return correct data from Convex
- Type-safe with proper error handling

---

### Story 3.2: Create Debate Mutations
**Priority:** P0 | **Status:** 🔴 TODO  
**Points:** 3

**Description:**  
Implement Convex mutations for creating and updating debates.

**Acceptance Criteria:**
- [ ] Create `createDebate` mutation
- [ ] Create `updateDebate` mutation
- [ ] Create `addTurn` mutation
- [ ] Create `updateDebateStatus` mutation
- [ ] Create `deleteDebate` mutation (for cleanup)
- [ ] Add input validation

**Files Created:**
- `convex/debates.ts` (mutations)

**Definition of Done:**
- Mutations work in Convex dashboard
- Data persists correctly

---

### Story 3.3: Create Real-time Subscriptions
**Priority:** P0 | **Status:** 🔴 TODO  
**Points:** 5

**Description:**  
Implement Convex subscriptions for real-time debate updates (replacement for SSE).

**Acceptance Criteria:**
- [ ] Create `watchDebate` subscription for live debate updates
- [ ] Create `watchTurns` subscription for streaming turns
- [ ] Handle connection state management
- [ ] Implement reconnection logic
- [ ] Optimize subscription performance

**Files Created:**
- `convex/subscriptions.ts`

**Definition of Done:**
- Subscriptions push updates in real-time
- Frontend receives updates without polling

---

## Epic 4: LLM Integration Layer
*Implement the LLM client with streaming support via OpenRouter*

### Story 4.1: Create LLM Client Module
**Priority:** P0 | **Status:** 🔴 TODO  
**Points:** 5

**Description:**  
Build the LLM client that interfaces with OpenRouter API for streaming responses.

**Acceptance Criteria:**
- [ ] Configure OpenAI client with OpenRouter base URL
- [ ] Implement `streamDebateResponse` async generator function
- [ ] Support reasoning filtering via `<reasoning>` tags
- [ ] Handle streaming tokens properly
- [ ] Implement timeout handling (30s per turn)
- [ ] Add retry logic for API failures

**Files Created:**
- `lib/llm.ts`

**Definition of Done:**
- Can stream responses from OpenRouter
- Reasoning filtered correctly
- Handles errors gracefully

---

### Story 4.2: Implement System Prompt Builder
**Priority:** P0 | **Status:** 🔴 TODO  
**Points:** 3

**Description:**  
Create dynamic system prompt generation for debaters based on debate context.

**Acceptance Criteria:**
- [ ] Create `buildMessages` function
- [ ] Generate contextual system prompts
- [ ] Include debate topic and objectives
- [ ] Add conversation history to messages
- [ ] Support custom objectives per debater
- [ ] Format opponent information correctly

**Files Created:**
- `lib/llm.ts` (message builder)

**Definition of Done:**
- Prompts are contextual and relevant
- History properly formatted for LLM

---

### Story 4.3: Implement Debate Intelligence
**Priority:** P1 | **Status:** 🔴 TODO  
**Points:** 3

**Description:**  
Add intelligence features to detect debate state (agreement, circular arguments, etc.).

**Acceptance Criteria:**
- [ ] Implement `checkForAgreement` function
  - Detect phrases: "I agree", "I concede", "you're right", etc.
- [ ] Implement `checkForCircularArgument` function
  - Detect 3+ similar consecutive turns
  - Use simple similarity comparison
- [ ] Add confidence scoring

**Files Created:**
- `lib/debate-intelligence.ts`

**Definition of Done:**
- Agreement detection works correctly
- Circular argument detection prevents infinite loops

---

## Epic 5: Debate Engine (Server-Side)
*Build the core debate orchestration logic with Convex actions*

### Story 5.1: Create Debate Orchestrator
**Priority:** P0 | **Status:** 🔴 TODO  
**Points:** 8

**Description:**  
Build the server-side debate engine that manages turns, streaming, and state transitions.

**Acceptance Criteria:**
- [ ] Create `runDebateTurn` Convex action
- [ ] Implement turn state machine (CREATED → RUNNING → COMPLETED)
- [ ] Manage current speaker rotation (A → B → A → B)
- [ ] Stream tokens to subscribers in real-time
- [ ] Record completed turns in Convex
- [ ] Check for debate end conditions:
  - Max turns reached
  - Agreement detected
  - Circular arguments detected
- [ ] Handle pause/resume states
- [ ] Implement error recovery

**Files Created:**
- `convex/debateEngine.ts`

**Definition of Done:**
- Debate runs automatically turn-by-turn
- State persists in Convex
- Subscribers receive real-time updates

---

### Story 5.2: Implement User Actions Handler
**Priority:** P1 | **Status:** 🔴 TODO  
**Points:** 3

**Description:**  
Handle user actions (pause, resume, skip, inject) during debates.

**Acceptance Criteria:**
- [ ] Create `processUserAction` mutation
- [ ] Implement `pause` action - stops turn progression
- [ ] Implement `resume` action - continues debate
- [ ] Implement `skip` action - skips current debater
- [ ] Implement `inject` action - adds user comment as special turn
- [ ] Queue actions during streaming
- [ ] Broadcast action events to subscribers

**Files Created:**
- `convex/actions.ts`

**Definition of Done:**
- All action types work correctly
- Actions queued/applied at appropriate times

---

## Epic 6: API Routes
*Create Next.js API routes for debate management*

### Story 6.1: Create Debate API Routes
**Priority:** P0 | **Status:** 🔴 TODO  
**Points:** 3

**Description:**  
Build REST API endpoints for debate CRUD operations.

**Acceptance Criteria:**
- [ ] `POST /api/debates` - Create new debate
  - Validate input
  - Generate unique ID
  - Store in Convex
  - Return debate object
- [ ] `GET /api/debates` - List debates (optional for MVP)
- [ ] `GET /api/debates/[id]` - Get single debate
- [ ] Proper error handling with HTTP status codes

**Files Created:**
- `app/api/debates/route.ts`
- `app/api/debates/[id]/route.ts`

**Definition of Done:**
- API endpoints respond correctly
- Error handling works

---

### Story 6.2: Create SSE Stream Route (Alternative/Backup)
**Priority:** P1 | **Status:** 🔴 TODO  
**Points:** 5

**Description:**  
Create Server-Sent Events endpoint for streaming debate updates (as backup to Convex subscriptions).

**Acceptance Criteria:**
- [ ] `GET /api/debates/[id]/stream` - SSE endpoint
- [ ] Implement proper SSE headers
- [ ] Stream events: `debate.started`, `turn.started`, `token`, `turn.completed`, `debate.completed`
- [ ] Handle client disconnections
- [ ] Support reconnection with state recovery
- [ ] Manage connection lifecycle

**Files Created:**
- `app/api/debates/[id]/stream/route.ts`

**Definition of Done:**
- SSE connection stays open
- Events stream in real-time
- Reconnection works

---

### Story 6.3: Create Action API Route
**Priority:** P1 | **Status:** 🔴 TODO  
**Points:** 2

**Description:**  
Build API endpoint for user actions during debates.

**Acceptance Criteria:**
- [ ] `POST /api/debates/[id]/action` - Process user action
- [ ] Accept action type and payload
- [ ] Validate action
- [ ] Apply action to debate state
- [ ] Return success/error response

**Files Created:**
- `app/api/debates/[id]/action/route.ts`

**Definition of Done:**
- Actions processed correctly
- State updated in Convex

---

## Epic 7: Frontend - Setup Page
*Build the debate configuration UI*

### Story 7.1: Create Setup Page Layout
**Priority:** P0 | **Status:** 🔴 TODO  
**Points:** 3

**Description:**  
Build the main landing page with debate configuration form.

**Acceptance Criteria:**
- [ ] Create responsive layout with dark theme
- [ ] Add header with app title and description
- [ ] Style with Tailwind and shadcn components
- [ ] Ensure mobile-friendly design

**Files Modified:**
- `app/page.tsx`

**Definition of Done:**
- Page renders beautifully on all screen sizes
- Dark theme applied consistently

---

### Story 7.2: Implement Debate Configuration Form
**Priority:** P0 | **Status:** 🔴 TODO  
**Points:** 5

**Description:**  
Create the form for configuring debate parameters.

**Acceptance Criteria:**
- [ ] Topic textarea with placeholder
- [ ] Debater A configuration:
  - Model dropdown (OpenRouter models)
  - Name display
  - Custom objective input (optional)
- [ ] Debater B configuration (same as A)
  - VS badge between debaters
- [ ] Settings section:
  - Max turns input (2-50, default 10)
  - Winning condition dropdown
- [ ] Form validation
- [ ] Loading state during submission

**Fields:**
- Topic: string (required)
- Debater A: `{ model: string, name: string, objective?: string }`
- Debater B: `{ model: string, name: string, objective?: string }`
- Max Turns: number (default: 10)
- Winning Condition: `'self-terminate' | 'user-decides' | 'ai-judge'`

**Files Modified:**
- `app/page.tsx`

**Definition of Done:**
- All fields functional
- Validation works
- Form submits to API

---

### Story 7.3: Add Available Models Configuration
**Priority:** P1 | **Status:** 🔴 TODO  
**Points:** 2

**Description:**  
Configure the list of available LLM models from OpenRouter.

**Acceptance Criteria:**
- [ ] Create models configuration list:
  - Claude 3.5 Sonnet
  - Claude 3 Opus
  - GPT-4
  - GPT-4 Turbo
  - Gemini Pro
  - Llama 3 70B
- [ ] Display model names in dropdowns
- [ ] Store model IDs for API calls

**Files Created:**
- `lib/config.ts`

**Definition of Done:**
- All models selectable
- Correct model IDs used

---

## Epic 8: Frontend - Debate View Page
*Build the real-time debate viewing interface*

### Story 8.1: Create Debate View Layout
**Priority:** P0 | **Status:** 🔴 TODO  
**Points:** 3

**Description:**  
Build the debate view page layout with header, debate cards, and control bar.

**Acceptance Criteria:**
- [ ] Create route at `/debate/[id]`
- [ ] Build header with:
  - Debate topic title
  - Connection status badge
  - Debater names
- [ ] Create main content area with debate cards
- [ ] Add debate log section
- [ ] Responsive design

**Files Created:**
- `app/debate/[id]/page.tsx`

**Definition of Done:**
- Layout renders correctly
- All sections visible
- Mobile responsive

---

### Story 8.2: Implement Real-time Debate Streaming
**Priority:** P0 | **Status:** 🔴 TODO  
**Points:** 8

**Description:**  
Connect to Convex subscriptions for real-time debate updates and streaming.

**Acceptance Criteria:**
- [ ] Connect to `watchDebate` subscription
- [ ] Connect to `watchTurns` subscription
- [ ] Handle debate state updates
- [ ] Stream tokens in real-time to debater cards
- [ ] Show typing indicator during streaming
- [ ] Handle connection errors and reconnection
- [ ] Update UI on each event type:
  - `debate.started` - Initialize state
  - `turn.started` - Show speaker indicator
  - `token` - Append to streaming content
  - `turn.completed` - Move to debate log
  - `debate.completed` - Show winner

**Files Modified:**
- `app/debate/[id]/page.tsx`

**Definition of Done:**
- Real-time updates work
- Streaming visible to user
- Reconnection automatic

---

### Story 8.3: Create Debater Card Component
**Priority:** P0 | **Status:** 🔴 TODO  
**Points:** 3

**Description:**  
Build the component showing one debater's current state.

**Acceptance Criteria:**
- [ ] Create `DebateCard` component
- [ ] Display debater name and avatar
- [ ] Show streaming content with typing cursor
- [ ] Highlight current speaker with ring border
- [ ] Show "Speaking..." badge when active
- [ ] Show "Thinking..." or "Waiting..." when inactive

**Files Created:**
- `components/debate-card.tsx`

**Definition of Done:**
- Component renders correctly
- Updates in real-time
- Visual states clear

---

### Story 8.4: Create Debate Control Bar
**Priority:** P1 | **Status:** 🔴 TODO  
**Points:** 3

**Description:**  
Build the control bar for user interaction during debates.

**Acceptance Criteria:**
- [ ] Create `ControlBar` component
- [ ] Add Pause/Resume button with icon
- [ ] Add Skip Turn button
- [ ] Add Inject Comment button (with modal)
- [ ] Disable controls when debate completed
- [ ] Show button states (loading, disabled)

**Files Created:**
- `components/control-bar.tsx`

**Definition of Done:**
- All buttons functional
- Actions trigger API calls
- UI feedback on actions

---

### Story 8.5: Create Debate Log Component
**Priority:** P1 | **Status:** 🔴 TODO  
**Points:** 3

**Description:**  
Build the scrollable debate history log showing all completed turns.

**Acceptance Criteria:**
- [ ] Create `DebateLog` component
- [ ] Show list of all turns
- [ ] Each turn displays:
  - Turn number badge
  - Debater name
  - Full content
  - Timestamp
- [ ] Auto-scroll to latest turn
- [ ] Collapsible on mobile

**Files Created:**
- `components/debate-log.tsx`

**Definition of Done:**
- Log displays all turns
- Auto-scrolls correctly
- Readable formatting

---

### Story 8.6: Create Winner Display Component
**Priority:** P1 | **Status:** 🟡 TODO  
**Points:** 2

**Description:**  
Build the winner announcement UI shown when debate ends.

**Acceptance Criteria:**
- [ ] Create `WinnerBanner` component
- [ ] Show trophy icon
- [ ] Display winner name or "Draw"
- [ ] Show reason for ending
- [ ] Celebratory styling (gradient, animation)
- [ ] Option to start new debate

**Files Created:**
- `components/winner-banner.tsx`

**Definition of Done:**
- Banner displays on completion
- Visual impact appropriate
- New debate button works

---

## Epic 9: Error Handling & Edge Cases
*Implement robust error handling and edge case management*

### Story 9.1: Implement Error Boundaries
**Priority:** P1 | **Status:** 🔴 TODO  
**Points:** 3

**Description:**  
Add error boundaries to catch and handle React errors gracefully.

**Acceptance Criteria:**
- [ ] Create `ErrorBoundary` component
- [ ] Wrap main page components
- [ ] Show user-friendly error messages
- [ ] Provide retry/refresh options
- [ ] Log errors for debugging

**Files Created:**
- `components/error-boundary.tsx`

**Definition of Done:**
- Errors caught gracefully
- Users see helpful messages
- App doesn't crash

---

### Story 9.2: Handle API Errors
**Priority:** P1 | **Status:** 🔴 TODO  
**Points:** 3

**Description:**  
Implement comprehensive API error handling throughout the app.

**Acceptance Criteria:**
- [ ] Handle OpenRouter API failures
  - Retry once, then skip turn
  - Show error indicator
- [ ] Handle Convex connection errors
  - Auto-retry with backoff
  - Show connection status
- [ ] Handle network errors
  - Queue actions offline
  - Sync when reconnected
- [ ] Display error banners/toasts

**Files Modified:**
- Various API files

**Definition of Done:**
- All API calls have error handling
- Users informed of issues
- Recovery automatic where possible

---

### Story 9.3: Implement Debate Cleanup
**Priority:** P2 | **Status:** 🔴 TODO  
**Points:** 2

**Description:**  
Add automatic cleanup of old debates to prevent storage bloat.

**Acceptance Criteria:**
- [ ] Create cleanup Convex action
- [ ] Delete debates older than 24 hours
- [ ] Schedule cleanup to run hourly
- [ ] Log cleanup activity

**Files Created:**
- `convex/cleanup.ts`

**Definition of Done:**
- Old debates auto-deleted
- Cleanup runs on schedule

---

## Epic 10: Polish & Launch Preparation
*Final polish, documentation, and deployment*

### Story 10.1: Add Loading States
**Priority:** P1 | **Status:** 🔴 TODO  
**Points:** 2

**Description:**  
Implement loading states and skeletons throughout the app.

**Acceptance Criteria:**
- [ ] Add loading skeleton for setup page
- [ ] Add loading state for debate creation
- [ ] Add loading spinner for debate view
- [ ] Add loading states for async actions
- [ ] Ensure no layout shift during loading

**Files Modified:**
- Various component files

**Definition of Done:**
- No jarring loading experiences
- Skeletons match final layout

---

### Story 10.2: Add Animations & Transitions
**Priority:** P2 | **Status:** 🔴 TODO  
**Points:** 3

**Description:**  
Add polish with smooth animations and transitions.

**Acceptance Criteria:**
- [ ] Animate streaming text appearance
- [ ] Add transition between turns
- [ ] Animate winner banner entrance
- [ ] Add hover effects on buttons
- [ ] Smooth page transitions

**Files Modified:**
- Component files with Framer Motion or CSS transitions

**Definition of Done:**
- App feels polished and responsive
- Animations enhance UX

---

### Story 10.3: Write README Documentation
**Priority:** P1 | **Status:** 🔴 TODO  
**Points:** 2

**Description:**  
Create comprehensive README with setup and usage instructions.

**Acceptance Criteria:**
- [ ] Project description
- [ ] Features list
- [ ] Prerequisites (Node.js, API keys)
- [ ] Installation steps
- [ ] Environment variables documentation
- [ ] Tech stack listing
- [ ] Deployment instructions

**Files Created:**
- `README.md`

**Definition of Done:**
- README is clear and complete
- New developer can follow setup

---

### Story 10.4: Deploy to Vercel
**Priority:** P0 | **Status:** 🔴 TODO  
**Points:** 3

**Description:**  
Deploy the application to Vercel production.

**Acceptance Criteria:**
- [ ] Configure Vercel project
- [ ] Set environment variables in Vercel
- [ ] Configure Convex deployment
- [ ] Deploy production build
- [ ] Verify all features work
- [ ] Test with real OpenRouter API
- [ ] Configure custom domain (optional)

**Definition of Done:**
- App live at Vercel URL
- All features functional
- Performance acceptable

---

## Backlog / Future Enhancements

### Story B.1: Add Debate History Page
**Priority:** P3 | **Status:** 🔴 BACKLOG**

View past debates, search, filter, and replay.

### Story B.2: Implement AI Judge
**Priority:** P3 | **Status:** 🔴 BACKLOG**

Third LLM evaluates and scores debates.

### Story B.3: Add User Authentication
**Priority:** P3 | **Status:** 🔴 BACKLOG**

Allow users to save debates, track history, and vote on winners.

### Story B.4: Support Multiple Providers
**Priority:** P3 | **Status:** 🔴 BACKLOG**

Add direct Anthropic, OpenAI, local model support.

### Story B.5: Add Analytics Dashboard
**Priority:** P3 | **Status:** 🔴 BACKLOG**

Track win rates by model, popular topics, debate statistics.

### Story B.6: Add Debate Templates
**Priority:** P3 | **Status:** 🔴 BACKLOG**

Pre-built debate scenarios and topics.

### Story B.7: Export Debates
**Priority:** P3 | **Status:** 🔴 BACKLOG**

Export debates to PDF, Markdown, or share links.

---

## Sprint Planning Summary

### Sprint 1 (Foundation)
**Stories:** 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2  
**Points:** 17  
**Focus:** Project setup, types, Convex configuration

### Sprint 2 (Backend Core)
**Stories:** 3.1, 3.2, 3.3, 4.1, 4.2  
**Points:** 19  
**Focus:** Convex queries/mutations/subscriptions, LLM client

### Sprint 3 (Debate Engine)
**Stories:** 4.3, 5.1, 5.2, 6.1, 6.2, 6.3  
**Points:** 24  
**Focus:** Debate orchestration, API routes, intelligence

### Sprint 4 (Frontend Core)
**Stories:** 7.1, 7.2, 7.3, 8.1, 8.2, 8.3  
**Points:** 24  
**Focus:** Setup page, debate view, real-time streaming

### Sprint 5 (UI Polish)
**Stories:** 8.4, 8.5, 8.6, 9.1, 9.2, 9.3, 10.1, 10.2  
**Points:** 21  
**Focus:** Controls, log, winner display, error handling, animations

### Sprint 6 (Launch)
**Stories:** 1.6, 10.3, 10.4  
**Points:** 8  
**Focus:** Final config, docs, deployment

**Total Points:** ~113  
**Estimated Timeline:** 6 sprints (3-4 weeks with 1 developer)

---

## Definition of Done (Global)

For each story to be considered complete:

1. **Code Quality**
   - TypeScript compiles without errors
   - No console errors or warnings
   - Code follows project conventions

2. **Functionality**
   - All acceptance criteria met
   - Manual testing completed
   - Edge cases handled

3. **Integration**
   - Works with Convex backend
   - API routes functional
   - Real-time updates work

4. **UX**
   - Responsive on mobile and desktop
   - Dark theme applied consistently
   - Loading states handled

5. **Documentation**
   - Complex logic commented
   - README updated if needed
   - No breaking changes without notice
