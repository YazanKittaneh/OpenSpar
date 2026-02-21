import { ConvexHttpClient } from "convex/browser";

import { getServerEnv } from "@/lib/env";

export function getConvexHttpClient() {
  const env = getServerEnv();
  return new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);
}
