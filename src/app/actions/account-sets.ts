"use server";

import { db } from "@/lib/drizzle/db";
import { eq } from "drizzle-orm";
import {
  AccountSetTable,
  AccountTable,
  type NewAccountSet,
  type NewAccount,
} from "@/lib/drizzle/schema";

export type AccountSetWithAccounts = typeof AccountSetTable.$inferSelect & {
  accounts: (typeof AccountTable.$inferSelect)[];
};

export async function createAccountSet(
  accountSet: NewAccountSet,
  accounts: NewAccount[]
): Promise<AccountSetWithAccounts> {
  return db.transaction(async (tx) => {
    // Create account set
    const [newSet] = await tx
      .insert(AccountSetTable)
      .values(accountSet)
      .returning();

    // Create all accounts for this set
    const newAccounts = await tx
      .insert(AccountTable)
      .values(
        accounts.map((account) => ({
          ...account,
          accountSetId: newSet.id,
        }))
      )
      .returning();

    return {
      ...newSet,
      accounts: newAccounts,
    };
  });
}

export async function getAccountSetById(
  id: number
): Promise<AccountSetWithAccounts | undefined> {
  const result = await db
    .select({
      accountSet: AccountSetTable,
      accounts: AccountTable,
    })
    .from(AccountSetTable)
    .leftJoin(AccountTable, eq(AccountTable.accountSetId, AccountSetTable.id))
    .where(eq(AccountSetTable.id, id));

  if (result.length === 0) return undefined;

  // Group accounts under account set
  const accountSet = result[0].accountSet;
  const accounts = result.map((r) => r.accounts).filter(Boolean);

  return {
    ...accountSet,
    accounts: accounts.filter((account) => account !== null),
  };
}

export async function getAllAccountSets(): Promise<AccountSetWithAccounts[]> {
  const result = await db
    .select({
      accountSet: AccountSetTable,
      accounts: AccountTable,
    })
    .from(AccountSetTable)
    .leftJoin(AccountTable, eq(AccountTable.accountSetId, AccountSetTable.id));

  // Group accounts by account set
  const accountSetsMap = new Map<number, AccountSetWithAccounts>();

  result.forEach((row) => {
    if (!accountSetsMap.has(row.accountSet.id)) {
      accountSetsMap.set(row.accountSet.id, {
        ...row.accountSet,
        accounts: [],
      });
    }
    if (row.accounts) {
      accountSetsMap.get(row.accountSet.id)!.accounts.push(row.accounts);
    }
  });

  return Array.from(accountSetsMap.values());
}
