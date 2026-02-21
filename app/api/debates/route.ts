import { NextRequest, NextResponse } from "next/server";

import { api } from "@/convex/_generated/api";
import { getConvexHttpClient } from "@/lib/convex";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      topic,
      debaterA,
      debaterB,
      maxTurns = 10,
      winningCondition = "self-terminate",
    } = body;

    if (!topic || !debaterA || !debaterB) {
      return NextResponse.json(
        { error: "Missing required fields: topic, debaterA, debaterB" },
        { status: 400 },
      );
    }

    const convex = getConvexHttpClient();
    const id = await convex.mutation(api.debates.createDebate, {
      topic,
      debaterA,
      debaterB,
      maxTurns,
      winningCondition,
    });

    const debate = await convex.query(api.debates.getDebate, { id: id as never });

    return NextResponse.json({ debate }, { status: 201 });
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
