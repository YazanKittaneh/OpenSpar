import OpenAI from "openai";

import { DebaterConfig, Speaker, Turn } from "@/lib/types";

const REQUEST_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 2;

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
4. You may use <reasoning>tags for your private thinking</reasoning>.
5. Keep responses concise (2-4 paragraphs).`;

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

function parseReasoningChunk(
  chunkText: string,
  state: { inReasoning: boolean; remainder: string },
) {
  const merged = state.remainder + chunkText;
  let i = 0;
  let visible = "";
  let hidden = "";

  while (i < merged.length) {
    const openIdx = merged.indexOf("<reasoning>", i);
    const closeIdx = merged.indexOf("</reasoning>", i);

    if (!state.inReasoning && openIdx === -1) {
      visible += merged.slice(i);
      i = merged.length;
    } else if (state.inReasoning && closeIdx === -1) {
      hidden += merged.slice(i);
      i = merged.length;
    } else if (!state.inReasoning && openIdx !== -1 && (closeIdx === -1 || openIdx < closeIdx)) {
      visible += merged.slice(i, openIdx);
      i = openIdx + "<reasoning>".length;
      state.inReasoning = true;
    } else if (state.inReasoning && closeIdx !== -1) {
      hidden += merged.slice(i, closeIdx);
      i = closeIdx + "</reasoning>".length;
      state.inReasoning = false;
    } else {
      break;
    }
  }

  state.remainder = i < merged.length ? merged.slice(i) : "";
  return { visible, hidden };
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
      const stream = await openai.chat.completions.create({
        model: debater.model,
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1000,
      }, { signal: abortController.signal });

      let fullContent = "";
      let fullReasoning = "";
      const parserState = { inReasoning: false, remainder: "" };

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content ?? "";
        if (!content) continue;

        const { visible, hidden } = parseReasoningChunk(content, parserState);
        fullReasoning += hidden;

        if (visible) {
          fullContent += visible;
          yield visible;
        }
      }

      if (parserState.remainder) {
        if (parserState.inReasoning) {
          fullReasoning += parserState.remainder;
        } else {
          fullContent += parserState.remainder;
          yield parserState.remainder;
        }
      }

      clearTimeout(timer);
      return {
        content: fullContent.trim(),
        reasoning: fullReasoning.trim() || undefined,
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
