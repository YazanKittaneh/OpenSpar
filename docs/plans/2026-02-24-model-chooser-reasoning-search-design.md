# Model Chooser Reasoning + Search Design

## Goal
Add a searchable model chooser with hybrid model discovery (curated defaults + OpenRouter catalog) and per-side reasoning toggles that affect runtime requests when supported.

## Decisions
- Hybrid catalog: keep curated defaults in `lib/config.ts` and merge in OpenRouter `/api/v1/models` results via a local API route.
- Per-side reasoning toggle: `debaterA` and `debaterB` each get their own `reasoningEnabled` flag.
- Runtime behavior: send OpenRouter reasoning request parameters only when the selected model supports them.
- UX fallback: if catalog fetch fails, curated models remain fully usable.

## Architecture
- `app/api/models/route.ts` proxies OpenRouter model catalog, normalizes payload, and exposes model capability metadata.
- `lib/models.ts` centralizes model types, normalization, merge/dedupe logic, and reasoning capability detection.
- `components/model-picker.tsx` provides searchable model selection UI for each side.
- `app/page.tsx` loads model catalog, merges with curated defaults, and renders per-side picker + reasoning toggle state.
- `lib/types.ts`, Convex schema/mutations, and `lib/llm.ts` are extended so `reasoningEnabled` persists and reaches the OpenRouter request body.

## Data Model Changes
Add optional `reasoningEnabled?: boolean` to debater configs (frontend, API payload, Convex schema, persisted debate record).

## Capability Semantics
- `reasoningCapable`: model likely supports reasoning (from `supported_parameters` and lightweight heuristics for common reasoning model names).
- `reasoningToggleable`: model supports explicit reasoning toggles (`reasoning` or `include_reasoning` parameter in OpenRouter metadata).

## Error Handling
- Catalog route errors return a typed failure response and non-200 status.
- Setup page shows a small warning and uses curated list only.
- Unknown selected models (stale dynamic selection) remain selectable via fallback label.

## Testing
- Unit tests for model normalization + merge behavior.
- LLM request test verifying reasoning params included only when enabled and supported.
