const requiredServerKeys = [
  "OPENROUTER_API_KEY",
  "CONVEX_DEPLOYMENT_URL",
  "NEXT_PUBLIC_CONVEX_URL",
] as const;

export type RequiredServerKey = (typeof requiredServerKeys)[number];

function requireEnv(key: RequiredServerKey): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getServerEnv() {
  return {
    OPENROUTER_API_KEY: requireEnv("OPENROUTER_API_KEY"),
    CONVEX_DEPLOYMENT_URL: requireEnv("CONVEX_DEPLOYMENT_URL"),
    NEXT_PUBLIC_CONVEX_URL: requireEnv("NEXT_PUBLIC_CONVEX_URL"),
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  };
}
