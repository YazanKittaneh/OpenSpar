import { CONFIG } from "./config";

export type ModelSource = "curated" | "openrouter";

export interface ModelCatalogEntry {
  id: string;
  name: string;
  provider: string;
  source: ModelSource;
  reasoningCapable: boolean;
  reasoningToggleable: boolean;
  supportedParameters?: string[];
  contextLength?: number;
  pricing?: {
    prompt?: number;
    completion?: number;
  };
}

interface OpenRouterModelRow {
  id?: unknown;
  name?: unknown;
  supported_parameters?: unknown;
  context_length?: unknown;
  pricing?: unknown;
  top_provider?: unknown;
}

interface OpenRouterModelsPayload {
  data?: unknown;
}

const REASONING_NAME_HINTS = [
  /\bo1\b/i,
  /\bo3\b/i,
  /\bo4\b/i,
  /\bgpt-5\b/i,
  /r1\b/i,
  /reasoner/i,
  /\bqwq\b/i,
  /thinking/i,
] as const;

function titleCaseProvider(segment: string) {
  const normalized = segment.toLowerCase();
  if (normalized === "openai") return "OpenAI";
  if (normalized === "meta-llama") return "Meta";
  if (normalized === "google") return "Google";
  if (normalized === "anthropic") return "Anthropic";

  return segment
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getProviderLabel(modelId: string): string {
  const [provider] = modelId.split("/");
  return provider ? titleCaseProvider(provider) : "Unknown";
}

function sanitizeSupportedParameters(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function sanitizeOptionalNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function sanitizePricing(
  value: unknown,
): ModelCatalogEntry["pricing"] | undefined {
  if (!value || typeof value !== "object") return undefined;
  const row = value as Record<string, unknown>;
  const prompt = sanitizeOptionalNumber(row.prompt);
  const completion = sanitizeOptionalNumber(row.completion);
  if (prompt === undefined && completion === undefined) return undefined;
  return { prompt, completion };
}

export function inferReasoningCapabilityFromName(id: string, name: string) {
  const haystack = `${id} ${name}`;
  return REASONING_NAME_HINTS.some((pattern) => pattern.test(haystack));
}

export function normalizeOpenRouterModel(row: OpenRouterModelRow): ModelCatalogEntry | null {
  if (typeof row.id !== "string" || !row.id.trim()) return null;
  const id = row.id.trim();
  const name = typeof row.name === "string" && row.name.trim() ? row.name.trim() : id;
  const supportedParameters = sanitizeSupportedParameters(row.supported_parameters);
  const supportsReasoningParam =
    supportedParameters.includes("reasoning") ||
    supportedParameters.includes("include_reasoning");
  const contextLength =
    sanitizeOptionalNumber(row.context_length) ||
    (row.top_provider &&
    typeof row.top_provider === "object"
      ? sanitizeOptionalNumber((row.top_provider as Record<string, unknown>).context_length)
      : undefined);
  const pricing = sanitizePricing(row.pricing);

  return {
    id,
    name,
    provider: getProviderLabel(id),
    source: "openrouter",
    reasoningCapable:
      supportsReasoningParam || inferReasoningCapabilityFromName(id, name),
    reasoningToggleable: supportsReasoningParam,
    supportedParameters: supportedParameters.length > 0 ? supportedParameters : undefined,
    contextLength,
    pricing,
  };
}

export function normalizeOpenRouterCatalog(payload: OpenRouterModelsPayload): ModelCatalogEntry[] {
  if (!Array.isArray(payload.data)) return [];

  return payload.data
    .map((row) => normalizeOpenRouterModel((row ?? {}) as OpenRouterModelRow))
    .filter((model): model is ModelCatalogEntry => model !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getCuratedModels(): ModelCatalogEntry[] {
  return CONFIG.DEFAULT_MODELS.map((model) => ({
    ...model,
    source: "curated" as const,
  }));
}

export function mergeModelCatalogs(
  curated: ModelCatalogEntry[],
  fetched: ModelCatalogEntry[],
): ModelCatalogEntry[] {
  const byId = new Map<string, ModelCatalogEntry>();

  for (const model of fetched) {
    byId.set(model.id, model);
  }

  for (const model of curated) {
    const fetchedMatch = byId.get(model.id);
    if (!fetchedMatch) {
      byId.set(model.id, model);
      continue;
    }

    byId.set(model.id, {
      ...fetchedMatch,
      ...model,
      source: "curated",
      reasoningCapable: fetchedMatch.reasoningCapable ?? model.reasoningCapable,
      reasoningToggleable: fetchedMatch.reasoningToggleable ?? model.reasoningToggleable,
      supportedParameters: fetchedMatch.supportedParameters ?? model.supportedParameters,
      contextLength: fetchedMatch.contextLength ?? model.contextLength,
      pricing: fetchedMatch.pricing ?? model.pricing,
    });
  }

  const merged = Array.from(byId.values());
  merged.sort((a, b) => {
    if (a.source !== b.source) {
      return a.source === "curated" ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
  return merged;
}

export function findModelById(models: ModelCatalogEntry[], id: string) {
  return models.find((model) => model.id === id);
}
