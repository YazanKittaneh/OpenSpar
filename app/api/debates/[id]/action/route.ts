import { NextResponse } from "next/server";

import { api } from "@/convex/_generated/api";
import { getConvexHttpClient } from "@/lib/convex";

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
      await convex.action(api.debateEngine.startDebate, {
        debateId: id as never,
      });
    }

    return NextResponse.json({ success: true, action }, { status: 200 });
  } catch (error) {
    console.error("Action error:", error);
    return NextResponse.json({ error: "Failed to process action" }, { status: 500 });
  }
}
