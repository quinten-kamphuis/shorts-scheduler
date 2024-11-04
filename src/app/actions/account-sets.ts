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

export async function updateAccountSet(
  id: number,
  accountSet: NewAccountSet,
  accounts: NewAccount[]
): Promise<AccountSetWithAccounts> {
  return db.transaction(async (tx) => {
    // Update account set
    await tx
      .update(AccountSetTable)
      .set(accountSet)
      .where(eq(AccountSetTable.id, id));

    // Update accounts
    await Promise.all(
      accounts.map((account) => {
        if (account.id === undefined) {
          throw new Error(
            `Account id is undefined for account: ${JSON.stringify(account)}`
          );
        }
        return tx
          .update(AccountTable)
          .set(account)
          .where(eq(AccountTable.id, account.id));
      })
    );

    const updatedAccountSet = await getAccountSetById(id);
    if (!updatedAccountSet) {
      throw new Error(`AccountSet with id ${id} not found`);
    }
    return updatedAccountSet;
  });
}

export async function deleteAccountSet(id: number): Promise<void> {
  await db.transaction(async (tx) => {
    // Delete all accounts in the set
    await tx.delete(AccountTable).where(eq(AccountTable.accountSetId, id));

    // Delete the account set
    await tx.delete(AccountSetTable).where(eq(AccountSetTable.id, id));
  });
}
