import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { env } from "@/lib/env";

const CURRENT_ENCRYPTION_VERSION = "v2";
const LEGACY_ENCRYPTION_VERSION = "v1";
const IV_LENGTH = 12;
const ALGORITHM = "aes-256-gcm";

type RotationKey = {
  id: string;
  value: string;
};

type DecryptedPlaidToken = {
  accessToken: string;
  shouldReencrypt: boolean;
};

function deriveKey(keyMaterial: string) {
  return createHash("sha256").update(keyMaterial).digest();
}

function getCurrentKey(): RotationKey {
  return {
    id: env.PLAID_ACCESS_TOKEN_ENCRYPTION_KEY_ID,
    value: env.PLAID_ACCESS_TOKEN_ENCRYPTION_KEY ?? env.SESSION_SECRET,
  };
}

function getPreviousKeys(): RotationKey[] {
  const raw = env.PLAID_ACCESS_TOKEN_ENCRYPTION_PREVIOUS_KEYS?.trim();

  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const separatorIndex = pair.indexOf(":");

      if (separatorIndex === -1) {
        return null;
      }

      const id = pair.slice(0, separatorIndex).trim();
      const value = pair.slice(separatorIndex + 1).trim();

      if (!id || !value) {
        return null;
      }

      return { id, value };
    })
    .filter((value): value is RotationKey => Boolean(value));
}

function getAllKnownKeys() {
  const current = getCurrentKey();
  return [current, ...getPreviousKeys().filter((key) => key.id !== current.id)];
}

function decryptWithKeyMaterial(
  encryptedValue: string,
  keyMaterial: string,
  version: string,
  iv: string,
  authTag: string,
  ciphertext: string,
) {
  const decipher = createDecipheriv(
    ALGORITHM,
    deriveKey(keyMaterial),
    Buffer.from(iv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(authTag, "base64url"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64url")),
    decipher.final(),
  ]);

  return {
    accessToken: decrypted.toString("utf8"),
    shouldReencrypt: version !== CURRENT_ENCRYPTION_VERSION,
  };
}

export function encryptPlaidAccessToken(accessToken: string) {
  const currentKey = getCurrentKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, deriveKey(currentKey.value), iv);
  const encrypted = Buffer.concat([cipher.update(accessToken, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    CURRENT_ENCRYPTION_VERSION,
    currentKey.id,
    iv.toString("base64url"),
    authTag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function isEncryptedPlaidAccessToken(value: string) {
  return value.startsWith(`${CURRENT_ENCRYPTION_VERSION}.`) || value.startsWith(`${LEGACY_ENCRYPTION_VERSION}.`);
}

export function decryptPlaidAccessToken(encryptedValue: string): string {
  return decryptPlaidAccessTokenDetailed(encryptedValue).accessToken;
}

export function decryptPlaidAccessTokenDetailed(
  encryptedValue: string,
): DecryptedPlaidToken {
  if (!isEncryptedPlaidAccessToken(encryptedValue)) {
    return {
      accessToken: encryptedValue,
      shouldReencrypt: true,
    };
  }

  const currentKey = getCurrentKey();
  const parts = encryptedValue.split(".");
  const version = parts[0];

  if (version === CURRENT_ENCRYPTION_VERSION) {
    const [, keyId, iv, authTag, ciphertext] = parts;

    if (!keyId || !iv || !authTag || !ciphertext) {
      throw new Error("INVALID_ENCRYPTED_PLAID_ACCESS_TOKEN");
    }

    const key = getAllKnownKeys().find((candidate) => candidate.id === keyId);

    if (!key) {
      throw new Error("UNKNOWN_PLAID_ACCESS_TOKEN_KEY");
    }

    const decrypted = decryptWithKeyMaterial(
      encryptedValue,
      key.value,
      version,
      iv,
      authTag,
      ciphertext,
    );

    return {
      ...decrypted,
      shouldReencrypt: key.id !== currentKey.id,
    };
  }

  const [, iv, authTag, ciphertext] = parts;

  if (version !== LEGACY_ENCRYPTION_VERSION || !iv || !authTag || !ciphertext) {
    throw new Error("INVALID_ENCRYPTED_PLAID_ACCESS_TOKEN");
  }

  for (const key of getAllKnownKeys()) {
    try {
      return {
        ...decryptWithKeyMaterial(encryptedValue, key.value, version, iv, authTag, ciphertext),
        shouldReencrypt: true,
      };
    } catch {
      continue;
    }
  }

  throw new Error("INVALID_ENCRYPTED_PLAID_ACCESS_TOKEN");
}
