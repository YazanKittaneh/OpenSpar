import { ConvexHttpClient } from "convex/browser";

import { getConvexEnv } from "@/lib/env";

export function getConvexHttpClient() {
  const env = getConvexEnv();
  return new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);
}
