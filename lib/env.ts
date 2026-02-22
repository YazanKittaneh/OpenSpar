function requireEnv(
  key: "CONVEX_DEPLOYMENT_URL" | "NEXT_PUBLIC_CONVEX_URL",
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
  };
}
