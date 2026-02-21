export function isConvexIdError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const msg = error.message.toLowerCase();
  return msg.includes("invalid argument") || msg.includes("invalid id") || msg.includes("argumentvalidationerror");
}
