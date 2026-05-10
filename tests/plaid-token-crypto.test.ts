import { beforeEach, describe, expect, it, vi } from "vitest";

async function importCryptoModule() {
  vi.resetModules();
  process.env.DATABASE_URL =
    "postgresql://postgres:postgres@localhost:5432/dashboard_financeiro?schema=public";
  process.env.SESSION_SECRET = "12345678901234567890123456789012";
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  process.env.PLAID_CLIENT_ID = "client-id";
  process.env.PLAID_SECRET = "secret";
  process.env.PLAID_ENV = "sandbox";
  process.env.PLAID_COUNTRY_CODES = "US";
  process.env.PLAID_PRODUCTS = "transactions";

  return import("@/lib/plaid-token-crypto");
}

describe("plaid token crypto", () => {
  beforeEach(() => {
    delete process.env.PLAID_ACCESS_TOKEN_ENCRYPTION_KEY;
    delete process.env.PLAID_ACCESS_TOKEN_ENCRYPTION_KEY_ID;
    delete process.env.PLAID_ACCESS_TOKEN_ENCRYPTION_PREVIOUS_KEYS;
  });

  it("decrypts tokens encrypted with a previous key and flags them for re-encryption", async () => {
    process.env.PLAID_ACCESS_TOKEN_ENCRYPTION_KEY = "legacy-key-material-12345678901234567890";
    process.env.PLAID_ACCESS_TOKEN_ENCRYPTION_KEY_ID = "key-2026-04";

    const legacyCrypto = await importCryptoModule();
    const encryptedWithLegacyKey = legacyCrypto.encryptPlaidAccessToken("access-sandbox-token");

    process.env.PLAID_ACCESS_TOKEN_ENCRYPTION_KEY = "current-key-material-1234567890123456789";
    process.env.PLAID_ACCESS_TOKEN_ENCRYPTION_KEY_ID = "key-2026-05";
    process.env.PLAID_ACCESS_TOKEN_ENCRYPTION_PREVIOUS_KEYS =
      "key-2026-04:legacy-key-material-12345678901234567890";

    const rotatedCrypto = await importCryptoModule();
    const decrypted = rotatedCrypto.decryptPlaidAccessTokenDetailed(encryptedWithLegacyKey);
    const reencrypted = rotatedCrypto.encryptPlaidAccessToken(decrypted.accessToken);

    expect(decrypted).toEqual({
      accessToken: "access-sandbox-token",
      shouldReencrypt: true,
    });
    expect(reencrypted.startsWith("v2.key-2026-05.")).toBe(true);
  });
});
