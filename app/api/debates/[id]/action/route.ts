import { NextResponse } from "next/server";

import { api } from "@/convex/_generated/api";
import { getConvexHttpClient } from "@/lib/convex";
import { isConvexIdError } from "@/lib/errors";

const validActions = ["pause", "resume", "skip", "inject"] as const;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const action = await req.json();

    if (!action || !validActions.includes(action.type)) {
      return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }

    const convex = getConvexHttpClient();
    const success = await convex.mutation(api.actions.processUserAction, {
      debateId: id as never,
      action,
    });

    if (!success) {
      return NextResponse.json({ error: "Debate not found" }, { status: 404 });
    }

    if (action.type === "resume") {
      void convex
        .action(api.debateEngine.startDebate, {
          debateId: id as never,
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
