import { supabase } from "@/lib/supabase";

type CreateTransactionParams = {
  account_id: number;
  category_id: number;
  transaction_type: "expense" | "income";
  amount: number;
  transaction_date: string;
  notes?: string | null;
  description?: string | null;
  to_account_id?: number | null;
};

export async function createTransaction(
  transaction: CreateTransactionParams
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("User not found.");
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      account_id: transaction.account_id,
      category_id: transaction.category_id,
      transaction_type: transaction.transaction_type,
      amount: transaction.amount,
      transaction_date: transaction.transaction_date,
      description: transaction.description ?? null,
      notes: transaction.notes ?? null,
      to_account_id: transaction.to_account_id ?? null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}