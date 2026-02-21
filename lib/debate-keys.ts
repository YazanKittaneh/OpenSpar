const KEY_TTL_MS = 24 * 60 * 60 * 1000;

type KeyRecord = {
  apiKey: string;
  createdAt: number;
};

const debateKeyStore = new Map<string, KeyRecord>();

export function setDebateApiKey(debateId: string, apiKey: string) {
  debateKeyStore.set(debateId, {
    apiKey,
    createdAt: Date.now(),
  });
}

export function getDebateApiKey(debateId: string): string | undefined {
  const record = debateKeyStore.get(debateId);
  if (!record) return undefined;

  if (Date.now() - record.createdAt > KEY_TTL_MS) {
    debateKeyStore.delete(debateId);
    return undefined;
  }

  return record.apiKey;
}

export function deleteDebateApiKey(debateId: string) {
  debateKeyStore.delete(debateId);
}
