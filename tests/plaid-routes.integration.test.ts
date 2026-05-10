import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRequireUser = vi.fn();
const mockSyncPlaidItem = vi.fn();
const mockExchangePublicToken = vi.fn();

vi.mock("@/lib/session", () => ({
  requireUser: mockRequireUser,
}));

vi.mock("@/server/plaid-service", () => ({
  syncPlaidItem: mockSyncPlaidItem,
  exchangePublicToken: mockExchangePublicToken,
}));

describe("plaid route handlers integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the sync payload from the plaid sync route", async () => {
    vi.resetModules();
    mockRequireUser.mockResolvedValue({ id: "user_1" });
    mockSyncPlaidItem.mockResolvedValue({
      syncedItems: 1,
      accountsSynced: 2,
      transactionsSynced: 8,
      lastSyncedAt: "2026-05-10T12:00:00.000Z",
    });

    const { POST } = await import("@/app/api/plaid/sync/route");
    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      syncedItems: 1,
      accountsSynced: 2,
      transactionsSynced: 8,
      lastSyncedAt: "2026-05-10T12:00:00.000Z",
    });
  });

  it("validates the exchange public token request body", async () => {
    vi.resetModules();
    mockRequireUser.mockResolvedValue({ id: "user_1" });

    const { POST } = await import("@/app/api/plaid/exchange-public-token/route");
    const response = await POST(
      new Request("http://localhost:3000/api/plaid/exchange-public-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicToken: "" }),
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("VALIDATION_ERROR");
  });

  it("returns the connected item from the exchange public token route", async () => {
    vi.resetModules();
    mockRequireUser.mockResolvedValue({ id: "user_1" });
    mockExchangePublicToken.mockResolvedValue({
      id: "plaid_item_1",
      itemId: "item_123",
    });

    const { POST } = await import("@/app/api/plaid/exchange-public-token/route");
    const response = await POST(
      new Request("http://localhost:3000/api/plaid/exchange-public-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicToken: "public-sandbox-token" }),
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      item: {
        id: "plaid_item_1",
        itemId: "item_123",
      },
    });
    expect(mockExchangePublicToken).toHaveBeenCalledWith(
      "user_1",
      "public-sandbox-token",
    );
  });
});
