import { NextResponse } from "next/server";

import { api } from "@/convex/_generated/api";
import { getConvexHttpClient } from "@/lib/convex";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const convex = getConvexHttpClient();
    const debate = await convex.query(api.debates.getDebate, { id: id as never });

    if (!debate) {
      return NextResponse.json({ error: "Debate not found" }, { status: 404 });
    }

    return NextResponse.json({ debate }, { status: 200 });
  } catch (error) {
    console.error("Error getting debate:", error);
    return NextResponse.json({ error: "Failed to fetch debate" }, { status: 500 });
  }
}
