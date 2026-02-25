import OpenAI from "openai";

import { DebaterConfig, Speaker, Turn } from "@/lib/types";

const REQUEST_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 2;
const PRIVATE_TAGS = [
  {
    name: "rationale_summary",
    open: "<rationale_summary>",
    close: "</rationale_summary>",
  },
  { name: "reasoning", open: "<reasoning>", close: "</reasoning>" },
] as const;

type PrivateTagName = (typeof PRIVATE_TAGS)[number]["name"];

function getClient(apiKey: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    defaultHeaders: {
      "HTTP-Referer": appUrl,
      "X-Title": "LLM Debate Arena",
    },
  });
}

export interface StreamResponse {
  content: string;
  reasoning?: string;
}

type OpenRouterReasoningParam = {
  enabled: boolean;
};

export type OpenRouterChatCompletionRequest =
  OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming & {
    reasoning?: OpenRouterReasoningParam;
  };

export function buildMessages(
  speaker: Speaker,
  debater: DebaterConfig,
  topic: string,
  previousTurns: Turn[],
  opponentObjective?: string,
): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  const objective =
    debater.objective ?? `Convincingly argue your position on: ${topic}`;
  const opponentGoal =
    opponentObjective ?? "to convince others of their perspective";

  const systemPrompt =
    debater.systemPrompt ??
    `You are ${debater.name}, participating in a debate.

Your objective: ${objective}
The topic: "${topic}"
Your opponent is trying ${opponentGoal}.

Rules:
1. Make persuasive, well-reasoned arguments.
2. Address points your opponent raised.
3. Be respectful but firm in your position.
4. Your visible response MUST be plain debate text only.
5. End every response with <rationale_summary>...</rationale_summary>.
6. Keep rationale summary to 1-2 short sentences (high-level justification only).
7. Do not output <reasoning> tags or private chain-of-thought.
8. Keep responses concise (2-4 paragraphs).`;

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
  ];

  for (const turn of previousTurns) {
    const role = turn.speaker === speaker ? "assistant" : "user";
    messages.push({ role, content: turn.content });
  }

  messages.push({ role: "user", content: "Your turn to respond." });

  return messages;
}

export function buildOpenRouterChatCompletionRequest(
  debater: DebaterConfig,
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
): OpenRouterChatCompletionRequest {
  const request: OpenRouterChatCompletionRequest = {
    model: debater.model,
    messages,
    stream: true,
    temperature: 0.7,
    max_tokens: 1000,
  };

  if (
    debater.reasoningToggleable &&
    typeof debater.reasoningEnabled === "boolean"
  ) {
    request.reasoning = { enabled: debater.reasoningEnabled };
  }

  return request;
}

function longestSuffixPrefixLength(text: string, token: string): number {
  const max = Math.min(text.length, token.length - 1);
  for (let len = max; len > 0; len -= 1) {
    if (text.endsWith(token.slice(0, len))) {
      return len;
    }
  }
  return 0;
}

export function parseReasoningChunk(
  chunkText: string,
  state: { activeTag: PrivateTagName | null; remainder: string },
) {
  const merged = state.remainder + chunkText;
  let cursor = 0;
  let visible = "";
  let hiddenReasoning = "";
  let hiddenRationaleSummary = "";
  state.remainder = "";

  const findNextOpenTag = (fromIndex: number) => {
    let result:
      | { index: number; tag: (typeof PRIVATE_TAGS)[number] }
      | null = null;

    for (const tag of PRIVATE_TAGS) {
      const index = merged.indexOf(tag.open, fromIndex);
      if (index === -1) continue;
      if (!result || index < result.index) {
        result = { index, tag };
      }
    }

    return result;
  };

  while (cursor < merged.length) {
    if (!state.activeTag) {
      const nextOpenTag = findNextOpenTag(cursor);
      if (!nextOpenTag) {
        const tail = merged.slice(cursor);
        const keep = PRIVATE_TAGS.reduce(
          (max, tag) => Math.max(max, longestSuffixPrefixLength(tail, tag.open)),
          0,
        );
        visible += tail.slice(0, tail.length - keep);
        state.remainder = tail.slice(tail.length - keep);
        cursor = merged.length;
      } else {
        visible += merged.slice(cursor, nextOpenTag.index);
        cursor = nextOpenTag.index + nextOpenTag.tag.open.length;
        state.activeTag = nextOpenTag.tag.name;
      }
    } else {
      const activeTag = PRIVATE_TAGS.find((tag) => tag.name === state.activeTag)!;
      const closeIdx = merged.indexOf(activeTag.close, cursor);

      if (closeIdx === -1) {
        const tail = merged.slice(cursor);
        const keep = longestSuffixPrefixLength(tail, activeTag.close);
        const captured = tail.slice(0, tail.length - keep);
        if (state.activeTag === "rationale_summary") {
          hiddenRationaleSummary += captured;
        } else {
          hiddenReasoning += captured;
        }
        state.remainder = tail.slice(tail.length - keep);
        cursor = merged.length;
      } else {
        const captured = merged.slice(cursor, closeIdx);
        if (state.activeTag === "rationale_summary") {
          hiddenRationaleSummary += captured;
        } else {
          hiddenReasoning += captured;
        }
        cursor = closeIdx + activeTag.close.length;
        state.activeTag = null;
      }
    }
  }

  return { visible, hiddenReasoning, hiddenRationaleSummary };
}

export async function* streamDebateResponse(
  apiKey: string,
  speaker: Speaker,
  debater: DebaterConfig,
  topic: string,
  previousTurns: Turn[],
  opponentObjective?: string,
): AsyncGenerator<string, StreamResponse, unknown> {
  const messages = buildMessages(
    speaker,
    debater,
    topic,
    previousTurns,
    opponentObjective,
  );

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= MAX_RETRIES) {
    const abortController = new AbortController();
    const timer = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);

    try {
      const openai = getClient(apiKey);
      const request = buildOpenRouterChatCompletionRequest(debater, messages);
      const stream = await openai.chat.completions.create(
        request as OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming,
        { signal: abortController.signal },
      );

      let fullContent = "";
      let fullReasoning = "";
      let fullRationaleSummary = "";
      const parserState = {
        activeTag: null as PrivateTagName | null,
        remainder: "",
      };

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content ?? "";
        if (!content) continue;

        const { visible, hiddenReasoning, hiddenRationaleSummary } = parseReasoningChunk(
          content,
          parserState,
        );
        fullReasoning += hiddenReasoning;
        fullRationaleSummary += hiddenRationaleSummary;

        if (visible) {
          fullContent += visible;
          yield visible;
        }
      }

      // Ignore unfinished tag fragments at stream end to prevent leaking markup.

      clearTimeout(timer);
      const normalizedRationaleSummary = fullRationaleSummary.trim();
      const normalizedReasoning = fullReasoning.trim();

      return {
        content: fullContent.trim(),
        reasoning:
          normalizedRationaleSummary ||
          normalizedReasoning ||
          undefined,
      };
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      attempt += 1;
      if (attempt > MAX_RETRIES) {
        break;
      }
    }
  }

  throw lastError;
}
