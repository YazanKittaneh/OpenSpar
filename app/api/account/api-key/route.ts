import { NextRequest, NextResponse } from "next/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

import { api } from "@/convex/_generated/api";
import { decryptApiKey, encryptApiKey, maskApiKey } from "@/lib/api-key-crypto";
import { getConvexHttpClient } from "@/lib/convex";

async function requireToken() {
  const token = await convexAuthNextjsToken();
  if (!token) {
    return null;
  }
  return token;
}

export async function GET() {
  try {
    const token = await requireToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const convex = getConvexHttpClient(token);
    const saved = await convex.query(api.userApiKeys.getMyEncryptedApiKey, {});

    if (!saved) {
      return NextResponse.json({ hasSavedKey: false }, { status: 200 });
    }

    const plaintext = decryptApiKey(saved);

    return NextResponse.json(
      {
        hasSavedKey: true,
        maskedKey: maskApiKey(plaintext),
        updatedAt: saved.updatedAt,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to load saved API key:", error);
    return NextResponse.json({ error: "Failed to load saved API key" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = await requireToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const apiKey = typeof body?.apiKey === "string" ? body.apiKey.trim() : "";

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 });
    }

    const encrypted = encryptApiKey(apiKey);
    const convex = getConvexHttpClient(token);

    await convex.mutation(api.userApiKeys.saveMyApiKey, encrypted);

    return NextResponse.json(
      {
        saved: true,
        maskedKey: maskApiKey(apiKey),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to save API key:", error);
    return NextResponse.json({ error: "Failed to save API key" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const token = await requireToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const convex = getConvexHttpClient(token);
    await convex.mutation(api.userApiKeys.deleteMyApiKey, {});

    return NextResponse.json({ deleted: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete API key:", error);
    return NextResponse.json({ error: "Failed to delete API key" }, { status: 500 });
  }
}
