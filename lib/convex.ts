import { ConvexHttpClient } from "convex/browser";

import { getConvexEnv } from "@/lib/env";

export function getConvexHttpClient(token?: string) {
  const env = getConvexEnv();
  const normalizedUrl = env.CONVEX_DEPLOYMENT_URL.replace(/\/+$/, "");
  const client = new ConvexHttpClient(normalizedUrl);
  if (token) {
    client.setAuth(token);
  }
  return client;
}
