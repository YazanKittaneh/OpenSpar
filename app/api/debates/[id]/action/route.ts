import { NextResponse } from "next/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

import { api } from "@/convex/_generated/api";
import { decryptApiKey } from "@/lib/api-key-crypto";
import { getConvexHttpClient } from "@/lib/convex";
import { getDebateApiKey, setDebateApiKey } from "@/lib/debate-keys";
import { isConvexIdError } from "@/lib/errors";

const validActions = ["pause", "resume", "skip", "inject", "stop"] as const;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const action = await req.json();
    const token = await convexAuthNextjsToken();
    const convex = getConvexHttpClient(token);

    if (!action || !validActions.includes(action.type)) {
      return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }

    const actionPayload = {
      type: action.type,
      payload: typeof action.payload === "string" ? action.payload : undefined,
    } as const;

    const success = await convex.mutation(api.actions.processUserAction, {
      debateId: id as never,
      action: actionPayload,
    });

    if (!success) {
      return NextResponse.json({ error: "Debate not found" }, { status: 404 });
    }

    if (action.type === "resume") {
      const providedKey =
        typeof action.apiKey === "string" && action.apiKey.trim().length > 0
          ? action.apiKey.trim()
          : undefined;
      let apiKey = providedKey ?? getDebateApiKey(id);

      if (!apiKey && token) {
        const saved = await convex.query(api.userApiKeys.getMyEncryptedApiKey, {});
        if (saved) {
          apiKey = decryptApiKey(saved);
        }
      }
      if (!apiKey) {
        return NextResponse.json(
          { error: "API key required to resume this debate." },
          { status: 400 },
        );
      }

      if (providedKey) {
        setDebateApiKey(id, providedKey);
      }

      void convex
        .action(api.debateEngine.startDebate, {
          debateId: id as never,
          apiKey,
        })
        .catch((error) => {
          console.error("Failed to resume debate:", error);
        });
    }

    return NextResponse.json({ success: true, action }, { status: 200 });
  } catch (error) {
    if (isConvexIdError(error)) {
      return NextResponse.json({ error: "Invalid debate id" }, { status: 400 });
    }
    console.error("Action error:", error);
    return NextResponse.json({ error: "Failed to process action" }, { status: 500 });
  }
}
