import { ConvexHttpClient } from "convex/browser";

import { getConvexEnv } from "@/lib/env";

export function getConvexHttpClient() {
  const env = getConvexEnv();
  const normalizedUrl = env.CONVEX_DEPLOYMENT_URL.replace(/\/+$/, "");
  return new ConvexHttpClient(normalizedUrl);
}
