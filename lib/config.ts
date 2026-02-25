export const CONFIG = {
  DEFAULT_MODELS: [
    {
      id: "anthropic/claude-3.5-sonnet",
      name: "Claude 3.5 Sonnet",
      provider: "Anthropic",
      reasoningCapable: true,
      reasoningToggleable: true,
    },
    {
      id: "anthropic/claude-3-opus",
      name: "Claude 3 Opus",
      provider: "Anthropic",
      reasoningCapable: true,
      reasoningToggleable: true,
    },
    {
      id: "openai/gpt-4",
      name: "GPT-4",
      provider: "OpenAI",
      reasoningCapable: false,
      reasoningToggleable: false,
    },
    {
      id: "openai/gpt-4-turbo",
      name: "GPT-4 Turbo",
      provider: "OpenAI",
      reasoningCapable: false,
      reasoningToggleable: false,
    },
    {
      id: "google/gemini-pro",
      name: "Gemini Pro",
      provider: "Google",
      reasoningCapable: true,
      reasoningToggleable: true,
    },
    {
      id: "meta-llama/llama-3-70b",
      name: "Llama 3 70B",
      provider: "Meta",
      reasoningCapable: false,
      reasoningToggleable: false,
    },
  ],
  TURN_TIMEOUT_MS: 30_000,
  MAX_TURNS_DEFAULT: 10,
  MAX_TURNS_LIMIT: 50,
  MAX_TURNS_MIN: 2,
  DEBATE_TTL_HOURS: 24,
  CLEANUP_INTERVAL_HOURS: 1,
} as const;

export const WINNING_CONDITIONS = [
  { value: "self-terminate", label: "Self terminate" },
  { value: "user-decides", label: "User decides" },
  { value: "ai-judge", label: "AI judge" },
] as const;
