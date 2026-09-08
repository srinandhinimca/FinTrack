import { supabase } from "@/lib/supabase";

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
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("User is not logged in.");
  }

  return user;
}

// =========================================
// GET ACCOUNTS
// =========================================

export async function getAccounts(): Promise<Account[]> {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("accounts")
    .select(
      `
        id,
        user_id,
        name,
        opening_balance,
        currency,
        color,
        created_at,
        updated_at
      `
    )
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "getAccounts error:",
      error
    );

    throw error;
  }

  return data ?? [];
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
    throw new Error(
      "Account name is required."
    );
  }

  const { data, error } = await supabase
    .from("accounts")
    .insert({
      id: crypto.randomUUID(),

      // IMPORTANT:
      // Always use the logged-in user's ID.
      user_id: user.id,

      name: accountName,

      opening_balance: openingBalance,

      currency,

      color,
    })
    .select()
    .single();

  if (error) {
    console.error(
      "createAccount error:",
      error
    );

    throw error;
  }

  return data;
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
    throw new Error(
      "Account name is required."
    );
  }

  const { data, error } = await supabase
    .from("accounts")
    .update({
      name: accountName,
      opening_balance: openingBalance,
      currency,
      color,
      updated_at: new Date().toISOString(),
    })
    .eq("id", accountId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error(
      "updateAccount error:",
      error
    );

    throw error;
  }

  return data;
}

// =========================================
// DELETE ACCOUNT
// =========================================

export async function deleteAccount(
  accountId: string
): Promise<void> {
  const user = await getCurrentUser();

  const { error } = await supabase
    .from("accounts")
    .delete()
    .eq("id", accountId)
    .eq("user_id", user.id);

  if (error) {
    console.error(
      "deleteAccount error:",
      error
    );

    throw error;
  }
}