import { beforeEach, describe, expect, it, vi } from "vitest";

const mockDb = {
  plaidItem: {
    upsert: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    findFirst: vi.fn(),
  },
  account: {
    upsert: vi.fn(),
    findMany: vi.fn(),
  },
  transaction: {
    upsert: vi.fn(),
    deleteMany: vi.fn(),
  },
  syncLog: {
    create: vi.fn(),
    update: vi.fn(),
  },
};

const mockPlaidClient = {
  institutionsGetById: vi.fn(),
  linkTokenCreate: vi.fn(),
  itemPublicTokenExchange: vi.fn(),
  itemGet: vi.fn(),
  accountsGet: vi.fn(),
  transactionsSync: vi.fn(),
};

vi.mock("@/lib/db", () => ({
  db: mockDb,
}));

vi.mock("@/lib/plaid", () => ({
  plaidClient: mockPlaidClient,
  plaidCountryCodes: ["US"],
  plaidProducts: ["transactions"],
}));

async function importPlaidModules() {
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

  const plaidService = await import("@/server/plaid-service");
  const crypto = await import("@/lib/plaid-token-crypto");

  return { plaidService, crypto };
}

describe("plaid service integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("encrypts the plaid access token before persisting the item", async () => {
    const { plaidService, crypto } = await importPlaidModules();

    mockPlaidClient.itemPublicTokenExchange.mockResolvedValue({
      data: {
        access_token: "access-sandbox-token",
        item_id: "item_123",
      },
    });
    mockPlaidClient.itemGet.mockResolvedValue({
      data: {
        item: {
          institution_id: "ins_1",
        },
      },
    });
    mockPlaidClient.institutionsGetById.mockResolvedValue({
      data: {
        institution: {
          name: "First Platypus Bank",
        },
      },
    });
    mockDb.plaidItem.upsert.mockResolvedValue({
      id: "plaid_item_1",
    });
    mockDb.plaidItem.findMany.mockResolvedValue([]);

    await plaidService.exchangePublicToken("user_1", "public-sandbox-token");

    const persistedAccessToken =
      mockDb.plaidItem.upsert.mock.calls[0]?.[0]?.create?.accessToken;

    expect(persistedAccessToken).toBeTruthy();
    expect(persistedAccessToken).not.toBe("access-sandbox-token");
    expect(crypto.decryptPlaidAccessToken(persistedAccessToken)).toBe(
      "access-sandbox-token",
    );
  });

  it("uses transactions sync incrementally and stores the next cursor", async () => {
    const { plaidService, crypto } = await importPlaidModules();

    const encryptedAccessToken = crypto.encryptPlaidAccessToken("access-sandbox-token");

    mockDb.plaidItem.findMany.mockResolvedValue([
      {
        id: "plaid_item_1",
        accessToken: encryptedAccessToken,
        syncCursor: "cursor_old",
      },
    ]);
    mockDb.syncLog.create.mockResolvedValue({ id: "sync_log_1" });
    mockPlaidClient.accountsGet.mockResolvedValue({
      data: {
        accounts: [
          {
            account_id: "acc_1",
            name: "Plaid Checking",
            official_name: "Plaid Gold Checking",
            type: "depository",
            subtype: "checking",
            mask: "0000",
            balances: {
              current: 1200.35,
              available: 1180.35,
              iso_currency_code: "USD",
            },
          },
        ],
      },
    });
    mockDb.account.findMany.mockResolvedValue([{ id: "local_acc_1", plaidAccountId: "acc_1" }]);
    mockPlaidClient.transactionsSync
      .mockResolvedValueOnce({
        data: {
          added: [
            {
              transaction_id: "txn_added",
              account_id: "acc_1",
              name: "Coffee Shop",
              merchant_name: "Coffee Shop",
              amount: 12.5,
              iso_currency_code: "USD",
              date: "2026-05-10",
              pending: false,
              personal_finance_category: {
                primary: "FOOD_AND_DRINK",
                detailed: "FOOD_AND_DRINK_COFFEE",
              },
            },
          ],
          modified: [],
          removed: [],
          has_more: true,
          next_cursor: "cursor_mid",
        },
      })
      .mockResolvedValueOnce({
        data: {
          added: [],
          modified: [
            {
              transaction_id: "txn_modified",
              account_id: "acc_1",
              name: "Payroll",
              merchant_name: "Employer Inc",
              amount: -2500,
              iso_currency_code: "USD",
              date: "2026-05-10",
              pending: false,
              personal_finance_category: {
                primary: "INCOME",
                detailed: "INCOME_WAGES",
              },
            },
          ],
          removed: [{ transaction_id: "txn_removed" }],
          has_more: false,
          next_cursor: "cursor_new",
        },
      });
    mockDb.transaction.deleteMany.mockResolvedValue({ count: 1 });
    mockDb.plaidItem.update.mockResolvedValue({});
    mockDb.syncLog.update.mockResolvedValue({});
    mockDb.plaidItem.findFirst.mockResolvedValue({
      lastSyncedAt: new Date("2026-05-10T12:00:00.000Z"),
    });

    const result = await plaidService.syncPlaidItem("user_1");

    expect(mockPlaidClient.accountsGet).toHaveBeenCalledWith({
      access_token: "access-sandbox-token",
    });
    expect(mockPlaidClient.transactionsSync).toHaveBeenNthCalledWith(1, {
      access_token: "access-sandbox-token",
      cursor: "cursor_old",
    });
    expect(mockPlaidClient.transactionsSync).toHaveBeenNthCalledWith(2, {
      access_token: "access-sandbox-token",
      cursor: "cursor_mid",
    });
    expect(mockDb.plaidItem.update).toHaveBeenCalledWith({
      where: { id: "plaid_item_1" },
      data: expect.objectContaining({
        syncCursor: "cursor_new",
      }),
    });
    expect(mockDb.transaction.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: "user_1",
        plaidTransactionId: {
          in: ["txn_removed"],
        },
      },
    });
    expect(result).toEqual({
      syncedItems: 1,
      accountsSynced: 1,
      transactionsSynced: 3,
      lastSyncedAt: "2026-05-10T12:00:00.000Z",
    });
  });
});
