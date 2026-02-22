import { NextRequest, NextResponse } from "next/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

import { api } from "@/convex/_generated/api";
import { decryptApiKey } from "@/lib/api-key-crypto";
import { getConvexHttpClient } from "@/lib/convex";
import { setDebateApiKey } from "@/lib/debate-keys";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      topic,
      debaterA,
      debaterB,
      maxTurns = 10,
      winningCondition = "self-terminate",
      apiKey,
    } = body;

    if (!topic || !debaterA || !debaterB) {
      return NextResponse.json(
        { error: "Missing required fields: topic, debaterA, debaterB" },
        { status: 400 },
      );
    }

    const token = await convexAuthNextjsToken();
    const convex = getConvexHttpClient(token);

    const providedKey =
      typeof apiKey === "string" && apiKey.trim().length > 0 ? apiKey.trim() : undefined;

    let resolvedApiKey = providedKey;
    if (!resolvedApiKey && token) {
      const saved = await convex.query(api.userApiKeys.getMyEncryptedApiKey, {});
      if (saved) {
        resolvedApiKey = decryptApiKey(saved);
      }
    }

    if (!resolvedApiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key is required. Provide one or sign in and save it." },
        { status: 400 },
      );
    }

    const id = await convex.mutation(api.debates.createDebate, {
      topic,
      debaterA,
      debaterB,
      maxTurns,
      winningCondition,
    });

    const debate = await convex.query(api.debates.getDebate, { id: id as never });
    if (debate) {
      setDebateApiKey(String(debate._id), resolvedApiKey);
      void convex.action(api.debateEngine.startDebate, {
        debateId: id as never,
        apiKey: resolvedApiKey,
      });
    }

    return NextResponse.json(
      {
        debate: debate
          ? {
              ...debate,
              id: debate._id,
            }
          : null,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating debate:", error);
    return NextResponse.json({ error: "Failed to create debate" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const convex = getConvexHttpClient();
    const debates = await convex.query(api.debates.getActiveDebates, {});
    return NextResponse.json({ debates }, { status: 200 });
  } catch (error) {
    console.error("Error listing debates:", error);
    return NextResponse.json({ error: "Failed to list debates" }, { status: 500 });
  }
}
