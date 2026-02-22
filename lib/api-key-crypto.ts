import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_VERSION = 1;

type EncryptedApiKey = {
  ciphertext: string;
  iv: string;
  keyVersion: number;
};

function getEncryptionKey(): Buffer {
  const secret = process.env.API_KEY_ENCRYPTION_SECRET;
  if (!secret || secret.trim().length < 16) {
    throw new Error(
      "Missing required environment variable: API_KEY_ENCRYPTION_SECRET (minimum 16 chars).",
    );
  }
  return createHash("sha256").update(secret).digest();
}

export function encryptApiKey(apiKey: string): EncryptedApiKey {
  const trimmed = apiKey.trim();
  if (!trimmed) {
    throw new Error("API key cannot be empty.");
  }

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(trimmed, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const payload = Buffer.concat([encrypted, authTag]);

  return {
    ciphertext: payload.toString("base64"),
    iv: iv.toString("base64"),
    keyVersion: KEY_VERSION,
  };
}

export function decryptApiKey(encrypted: EncryptedApiKey): string {
  const payload = Buffer.from(encrypted.ciphertext, "base64");
  const iv = Buffer.from(encrypted.iv, "base64");

  if (payload.length <= AUTH_TAG_LENGTH) {
    throw new Error("Encrypted API key payload is invalid.");
  }

  const ciphertext = payload.subarray(0, payload.length - AUTH_TAG_LENGTH);
  const authTag = payload.subarray(payload.length - AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString("utf8");
}

export function maskApiKey(apiKey: string): string {
  const trimmed = apiKey.trim();
  if (!trimmed) return "";
  if (trimmed.length <= 4) return "****";
  return `****${trimmed.slice(-4)}`;
}
