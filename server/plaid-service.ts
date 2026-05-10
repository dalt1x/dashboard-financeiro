import { Prisma, type InternalCategory } from "@prisma/client";
import type {
  RemovedTransaction,
  Transaction as PlaidTransaction,
  TransactionsSyncRequest,
} from "plaid";
import { db } from "@/lib/db";
import { mapPlaidCategoryToInternalCategory } from "@/lib/category-mapper";
import { plaidClient, plaidCountryCodes, plaidProducts } from "@/lib/plaid";
import {
  decryptPlaidAccessTokenDetailed,
  encryptPlaidAccessToken,
  isEncryptedPlaidAccessToken,
} from "@/lib/plaid-token-crypto";

function serializePlaidAmount(amount: number) {
  return new Prisma.Decimal(Math.abs(amount).toFixed(2));
}

function resolveDirection(amount: number) {
  return amount < 0 ? "INCOME" : "EXPENSE";
}

function resolveInternalCategory(transaction: PlaidTransaction): InternalCategory {
  return mapPlaidCategoryToInternalCategory({
    primary: transaction.personal_finance_category?.primary,
    detailed: transaction.personal_finance_category?.detailed,
    name: transaction.name,
  });
}

function getPlaidAccessToken(item: { accessToken: string }) {
  return decryptPlaidAccessTokenDetailed(item.accessToken).accessToken;
}

async function upgradePlaintextAccessTokenIfNeeded(item: {
  id: string;
  accessToken: string;
}) {
  const decrypted = decryptPlaidAccessTokenDetailed(item.accessToken);

  if (isEncryptedPlaidAccessToken(item.accessToken) && !decrypted.shouldReencrypt) {
    return item.accessToken;
  }

  const encryptedAccessToken = encryptPlaidAccessToken(decrypted.accessToken);

  await db.plaidItem.update({
    where: { id: item.id },
    data: {
      accessToken: encryptedAccessToken,
    },
  });

  item.accessToken = encryptedAccessToken;
  return encryptedAccessToken;
}

async function fetchInstitutionName(institutionId?: string | null) {
  if (!institutionId) {
    return null;
  }

  try {
    const response = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: plaidCountryCodes,
      options: {
        include_optional_metadata: true,
      },
    });

    return response.data.institution.name;
  } catch {
    return null;
  }
}

async function syncAccountsForItem(userId: string, item: { id: string; accessToken: string }) {
  const accountsResponse = await plaidClient.accountsGet({
    access_token: getPlaidAccessToken(item),
  });

  for (const account of accountsResponse.data.accounts) {
    await db.account.upsert({
      where: { plaidAccountId: account.account_id },
      update: {
        userId,
        plaidItemId: item.id,
        name: account.name,
        officialName: account.official_name ?? null,
        type: account.type,
        subtype: account.subtype ?? null,
        mask: account.mask ?? null,
        currentBalance: account.balances.current ?? null,
        availableBalance: account.balances.available ?? null,
        isoCurrencyCode: account.balances.iso_currency_code ?? "USD",
      },
      create: {
        userId,
        plaidItemId: item.id,
        plaidAccountId: account.account_id,
        name: account.name,
        officialName: account.official_name ?? null,
        type: account.type,
        subtype: account.subtype ?? null,
        mask: account.mask ?? null,
        currentBalance: account.balances.current ?? null,
        availableBalance: account.balances.available ?? null,
        isoCurrencyCode: account.balances.iso_currency_code ?? "USD",
      },
    });
  }

  return accountsResponse.data.accounts.length;
}

async function upsertTransactionsForItem(
  userId: string,
  item: { id: string },
  transactions: PlaidTransaction[],
) {
  const accountMap = await db.account.findMany({
    where: {
      userId,
      plaidItemId: item.id,
    },
    select: {
      id: true,
      plaidAccountId: true,
    },
  });

  const localAccountByPlaidId = new Map(
    accountMap.map((account) => [account.plaidAccountId, account.id]),
  );

  let syncedCount = 0;

  for (const transaction of transactions) {
    const localAccountId = localAccountByPlaidId.get(transaction.account_id);

    if (!localAccountId) {
      continue;
    }

    syncedCount += 1;

    await db.transaction.upsert({
      where: { plaidTransactionId: transaction.transaction_id },
      update: {
        userId,
        plaidItemId: item.id,
        accountId: localAccountId,
        name: transaction.name,
        merchantName: transaction.merchant_name ?? null,
        amount: serializePlaidAmount(transaction.amount),
        isoCurrencyCode: transaction.iso_currency_code ?? "USD",
        date: new Date(transaction.date),
        pending: transaction.pending,
        categoryPrimary: transaction.personal_finance_category?.primary ?? null,
        categoryDetailed: transaction.personal_finance_category?.detailed ?? null,
        internalCategory: resolveInternalCategory(transaction),
        direction: resolveDirection(transaction.amount),
      },
      create: {
        userId,
        plaidItemId: item.id,
        accountId: localAccountId,
        plaidTransactionId: transaction.transaction_id,
        name: transaction.name,
        merchantName: transaction.merchant_name ?? null,
        amount: serializePlaidAmount(transaction.amount),
        isoCurrencyCode: transaction.iso_currency_code ?? "USD",
        date: new Date(transaction.date),
        pending: transaction.pending,
        categoryPrimary: transaction.personal_finance_category?.primary ?? null,
        categoryDetailed: transaction.personal_finance_category?.detailed ?? null,
        internalCategory: resolveInternalCategory(transaction),
        direction: resolveDirection(transaction.amount),
      },
    });
  }

  return syncedCount;
}

async function removeTransactionsForItem(userId: string, removed: RemovedTransaction[]) {
  if (removed.length === 0) {
    return 0;
  }

  const result = await db.transaction.deleteMany({
    where: {
      userId,
      plaidTransactionId: {
        in: removed.map((transaction) => transaction.transaction_id),
      },
    },
  });

  return result.count;
}

async function syncTransactionsForItem(
  userId: string,
  item: { id: string; accessToken: string; syncCursor?: string | null },
) {
  let cursor = item.syncCursor ?? undefined;
  let hasMore = true;
  let totalAddedOrModified = 0;
  let totalRemoved = 0;

  while (hasMore) {
    const request: TransactionsSyncRequest = {
      access_token: getPlaidAccessToken(item),
      cursor,
    };

    const response = await plaidClient.transactionsSync(request);
    const { added, modified, removed, has_more, next_cursor } = response.data;

    totalAddedOrModified += await upsertTransactionsForItem(userId, item, [
      ...added,
      ...modified,
    ]);
    totalRemoved += await removeTransactionsForItem(userId, removed);

    cursor = next_cursor;
    hasMore = has_more;
  }

  await db.plaidItem.update({
    where: { id: item.id },
    data: {
      syncCursor: cursor ?? null,
      lastSyncedAt: new Date(),
    },
  });

  return totalAddedOrModified + totalRemoved;
}

export async function createPlaidLinkToken(userId: string) {
  const response = await plaidClient.linkTokenCreate({
    client_name: "Dashboard Financeiro",
    user: { client_user_id: userId },
    products: plaidProducts,
    country_codes: plaidCountryCodes,
    language: "en",
    webhook: undefined,
  });

  return response.data.link_token;
}

export async function exchangePublicToken(userId: string, publicToken: string) {
  const exchange = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  });

  const item = await plaidClient.itemGet({
    access_token: exchange.data.access_token,
  });

  const institutionName = await fetchInstitutionName(item.data.item.institution_id);

  const plaidItem = await db.plaidItem.upsert({
    where: { itemId: exchange.data.item_id },
    update: {
      userId,
      accessToken: encryptPlaidAccessToken(exchange.data.access_token),
      syncCursor: null,
      institutionId: item.data.item.institution_id ?? null,
      institutionName,
    },
    create: {
      userId,
      itemId: exchange.data.item_id,
      accessToken: encryptPlaidAccessToken(exchange.data.access_token),
      syncCursor: null,
      institutionId: item.data.item.institution_id ?? null,
      institutionName,
    },
  });

  await syncPlaidItem(userId, plaidItem.id);

  return plaidItem;
}

export async function disconnectPlaidItem(userId: string, plaidItemId: string) {
  const item = await db.plaidItem.findFirst({
    where: { id: plaidItemId, userId },
  });

  if (!item) {
    throw new Error("ITEM_NOT_FOUND");
  }

  await db.plaidItem.delete({
    where: { id: item.id },
  });
}

export async function disconnectAllPlaidItems(userId: string) {
  await db.plaidItem.deleteMany({
    where: { userId },
  });
}

export async function syncPlaidItem(userId: string, plaidItemId?: string) {
  const itemFilter = plaidItemId ? { id: plaidItemId } : undefined;
  const items = await db.plaidItem.findMany({
    where: {
      userId,
      ...itemFilter,
    },
  });

  if (items.length === 0) {
    return {
      syncedItems: 0,
      accountsSynced: 0,
      transactionsSynced: 0,
      lastSyncedAt: null,
    };
  }

  let totalAccounts = 0;
  let totalTransactions = 0;

  for (const item of items) {
    const syncLog = await db.syncLog.create({
      data: {
        userId,
        plaidItemId: item.id,
        status: "RUNNING",
      },
    });

    try {
      await upgradePlaintextAccessTokenIfNeeded(item);
      const syncedAccounts = await syncAccountsForItem(userId, item);
      const syncedTransactions = await syncTransactionsForItem(userId, item);
      totalAccounts += syncedAccounts;
      totalTransactions += syncedTransactions;

      await db.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: "SUCCESS",
          accountsSynced: syncedAccounts,
          transactionsSynced: syncedTransactions,
          finishedAt: new Date(),
        },
      });
    } catch (error) {
      await db.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: "FAILED",
          finishedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : "Unknown sync error",
        },
      });

      throw error;
    }
  }

  const latestItem = await db.plaidItem.findFirst({
    where: { userId },
    orderBy: { lastSyncedAt: "desc" },
    select: { lastSyncedAt: true },
  });

  return {
    syncedItems: items.length,
    accountsSynced: totalAccounts,
    transactionsSynced: totalTransactions,
    lastSyncedAt: latestItem?.lastSyncedAt?.toISOString() ?? null,
  };
}
