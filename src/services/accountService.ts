import { supabase } from "@/lib/supabase";
import { db } from "@/powersync";
import * as Crypto from "expo-crypto";

// =========================================
// ACCOUNT TYPE
// =========================================

export interface Account {
  id: string;
  user_id: string;
  name: string;
  opening_balance: number;
  currency: string;
  color: string | null;
  created_at: string;
  updated_at: string;
}

// =========================================
// GET CURRENT USER
// =========================================

async function getCurrentUser() {
  // getSession() uses the locally stored Supabase session,
  // so it works even when the phone is offline.
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (!session?.user) {
    throw new Error("User is not logged in.");
  }

  return session.user;
}

// =========================================
// GET ACCOUNTS
// =========================================

export async function getAccounts(): Promise<Account[]> {
  const user = await getCurrentUser();

  const rows = await db.getAll<any>(
    `
      SELECT
        id,
        user_id,
        name,
        opening_balance,
        currency,
        color,
        created_at,
        updated_at
      FROM accounts
      WHERE user_id = ?
      ORDER BY created_at DESC
    `,
    [user.id]
  );

  return rows.map((row) => ({
    ...row,
    opening_balance: Number(row.opening_balance),
  }));
}

// =========================================
// CREATE ACCOUNT
// =========================================

export async function createAccount({
  name,
  openingBalance,
  currency,
  color,
}: {
  name: string;
  openingBalance: number;
  currency: string;
  color: string;
}): Promise<Account> {
  const user = await getCurrentUser();

  const accountName = name.trim();

  if (!accountName) {
    throw new Error("Account name is required.");
  }

  const id = Crypto.randomUUID();
  const now = new Date().toISOString();

  await db.execute(
    `
      INSERT INTO accounts (
        id,
        user_id,
        name,
        opening_balance,
        currency,
        color,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      user.id,
      accountName,
      String(openingBalance),
      currency,
      color,
      now,
      now,
    ]
  );

  console.log("Account saved locally:", id);

  return {
    id,
    user_id: user.id,
    name: accountName,
    opening_balance: openingBalance,
    currency,
    color,
    created_at: now,
    updated_at: now,
  };
}

// =========================================
// UPDATE ACCOUNT
// =========================================

export async function updateAccount(
  accountId: string,
  {
    name,
    openingBalance,
    currency,
    color,
  }: {
    name: string;
    openingBalance: number;
    currency: string;
    color: string;
  }
): Promise<Account> {
  const user = await getCurrentUser();

  const accountName = name.trim();

  if (!accountName) {
    throw new Error("Account name is required.");
  }

  const now = new Date().toISOString();

  await db.execute(
    `
      UPDATE accounts
      SET
        name = ?,
        opening_balance = ?,
        currency = ?,
        color = ?,
        updated_at = ?
      WHERE id = ?
        AND user_id = ?
    `,
    [
      accountName,
      String(openingBalance),
      currency,
      color,
      now,
      accountId,
      user.id,
    ]
  );

  const account = await db.getOptional<any>(
    `
      SELECT
        id,
        user_id,
        name,
        opening_balance,
        currency,
        color,
        created_at,
        updated_at
      FROM accounts
      WHERE id = ?
        AND user_id = ?
    `,
    [accountId, user.id]
  );

  if (!account) {
    throw new Error("Account not found.");
  }

  return {
    ...account,
    opening_balance: Number(account.opening_balance),
  };
}

// =========================================
// DELETE ACCOUNT
// =========================================

export async function deleteAccount(
  accountId: string
): Promise<void> {
  const user = await getCurrentUser();

  await db.execute(
    `
      DELETE FROM accounts
      WHERE id = ?
        AND user_id = ?
    `,
    [accountId, user.id]
  );

  console.log("Account deleted locally:", accountId);
}