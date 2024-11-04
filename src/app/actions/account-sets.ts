"use server";

import { db } from "@/lib/drizzle/db";
import { and, eq, inArray } from "drizzle-orm";
import {
  AccountSetTable,
  AccountTable,
  type NewAccountSet,
  type NewAccount,
  PostStatusTable,
  NewPostStatus,
  PostTable,
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
    // First, verify the account set exists
    const [existingSet] = await tx
      .select()
      .from(AccountSetTable)
      .where(eq(AccountSetTable.id, id));

    if (!existingSet) {
      throw new Error(`AccountSet with id ${id} not found`);
    }

    // Update account set
    await tx
      .update(AccountSetTable)
      .set(accountSet)
      .where(eq(AccountSetTable.id, id));

    // Get existing accounts
    const existingAccounts = await tx
      .select()
      .from(AccountTable)
      .where(eq(AccountTable.accountSetId, id));

    // Determine accounts to delete, update, and insert
    const accountsToDelete = existingAccounts.filter(
      (existingAccount) =>
        !accounts.some((account) => account.id === existingAccount.id)
    );
    const accountsToUpdate = accounts.filter((account) =>
      existingAccounts.some(
        (existingAccount) => existingAccount.id === account.id
      )
    );
    const accountsToInsert = accounts.filter(
      (account) =>
        !existingAccounts.some(
          (existingAccount) => existingAccount.id === account.id
        )
    );

    // Delete accounts
    if (accountsToDelete.length > 0) {
      await tx.delete(AccountTable).where(
        and(
          eq(AccountTable.accountSetId, id),
          inArray(
            AccountTable.id,
            accountsToDelete.map((account) => account.id)
          )
        )
      );
    }

    // Update accounts
    for (const account of accountsToUpdate) {
      if (account.id === undefined) {
        throw new Error("Account id is required for update");
      }
      await tx
        .update(AccountTable)
        .set({
          ...account,
          accountSetId: id, // Ensure accountSetId is preserved
        })
        .where(eq(AccountTable.id, account.id));
    }

    // Insert new accounts
    if (accountsToInsert.length > 0) {
      // First insert the new accounts and get their IDs
      const insertedAccounts = await tx
        .insert(AccountTable)
        .values(
          accountsToInsert.map((account) => ({
            ...account,
            accountSetId: id,
          }))
        )
        .returning();

      // Get all posts for this account set
      const posts = await tx
        .select()
        .from(PostTable)
        .where(eq(PostTable.accountSetId, id));

      // Create statuses for all posts for the new accounts
      if (posts.length > 0) {
        const newStatuses = posts.flatMap<NewPostStatus>((post) =>
          insertedAccounts.map((account) => ({
            postId: post.id,
            accountId: account.id,
            notes: null,
            isPosted: false,
            postedAt: null,
          }))
        );

        if (newStatuses.length > 0) {
          await tx.insert(PostStatusTable).values(newStatuses);
        }
      }
    }

    // Return updated account set with accounts
    const updatedAccounts = await tx
      .select()
      .from(AccountTable)
      .where(eq(AccountTable.accountSetId, id));

    const updatedAccountSet = {
      ...existingSet,
      ...accountSet,
      accounts: updatedAccounts,
    };

    return updatedAccountSet;
  });
}

export async function deleteAccountSet(id: number): Promise<void> {
  await db.delete(AccountSetTable).where(eq(AccountSetTable.id, id));
}
