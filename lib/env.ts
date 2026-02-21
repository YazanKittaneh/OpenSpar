function requireEnv(
  key: "OPENROUTER_API_KEY" | "CONVEX_DEPLOYMENT_URL" | "NEXT_PUBLIC_CONVEX_URL",
): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getConvexEnv() {
  return {
    CONVEX_DEPLOYMENT_URL: requireEnv("CONVEX_DEPLOYMENT_URL"),
    NEXT_PUBLIC_CONVEX_URL: requireEnv("NEXT_PUBLIC_CONVEX_URL"),
  };
}

export function getOpenRouterEnv() {
  return {
    OPENROUTER_API_KEY: requireEnv("OPENROUTER_API_KEY"),
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  };
}
