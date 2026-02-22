# Optional Accounts + Saved API Keys Design

## Context
The app currently requires an API key at debate start and stores it only in process memory (`lib/debate-keys.ts`) plus browser `sessionStorage`. This blocks cross-device continuity and forces repeated key entry.

## Goals
- Keep anonymous usage available.
- Add optional accounts via Convex Auth.
- Let signed-in users save one encrypted OpenRouter API key.
- Reuse saved key automatically when creating or resuming debates.

## Non-Goals
- Multi-key management.
- OAuth provider setup in this iteration.
- Secret-manager/KMS integration.

## Architecture
- Add Convex Auth (`@convex-dev/auth`) with password-based account sign up/sign in.
- Add `userApiKeys` table keyed by auth user subject.
- Encrypt/decrypt API keys in Next.js server routes using `API_KEY_ENCRYPTION_SECRET` and AES-256-GCM.
- Keep per-debate transient memory key store for active-session continuity.

## Data Model
- `userApiKeys`
  - `userId: string`
  - `ciphertext: string`
  - `iv: string`
  - `keyVersion: number`
  - `createdAt: number`
  - `updatedAt: number`
  - index: `by_userId`

## API Flow
### Save key
Client calls `PUT /api/account/api-key` (authenticated) -> server encrypts -> Convex mutation stores by `userId`.

### Create debate
`POST /api/debates` resolves key in order:
1. request `apiKey`
2. saved account key (if authenticated)
3. 400 error

### Resume debate
`POST /api/debates/[id]/action` for `resume` resolves key in order:
1. request `apiKey`
2. transient debate key cache
3. saved account key (if authenticated)
4. 400 error

## Error Handling
- Missing auth for account key endpoints returns 401.
- Missing resolved key for create/resume returns 400 with actionable message.
- Corrupt/misconfigured encryption secret returns 500 and logs server-side only.

## Testing Strategy
- Run `convex codegen` after schema/function changes.
- Run lint/tests/build.
- Manual smoke:
  - anonymous create with pasted key
  - authenticated key save, clear input, create debate using saved key
  - resume paused debate without prompt using saved key fallback
