import { NextResponse } from "next/server";

import { normalizeOpenRouterCatalog } from "@/lib/models";

const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";
const MODELS_TIMEOUT_MS = 8_000;

export async function GET() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MODELS_TIMEOUT_MS);

  try {
    const response = await fetch(OPENROUTER_MODELS_URL, {
      method: "GET",
      signal: controller.signal,
      next: { revalidate: 60 * 30 },
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `OpenRouter catalog request failed (${response.status}).` },
        { status: 502 },
      );
    }

    const payload = (await response.json()) as { data?: unknown };
    const models = normalizeOpenRouterCatalog(payload);

    return NextResponse.json(
      { models, fetchedAt: Date.now() },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load model catalog.";
    return NextResponse.json({ error: message }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}

