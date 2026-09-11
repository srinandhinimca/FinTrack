import { column, Schema, Table } from '@powersync/react-native';

const accounts = new Table({
  user_id: column.text,
  name: column.text,
  opening_balance: column.text,
  currency: column.text,
  color: column.text,
  created_at: column.text,
  updated_at: column.text,
  account_id: column.integer,
});

const categories = new Table({
  user_id: column.text,
  name: column.text,
  icon: column.text,
  created_at: column.text,
  type: column.text,
  updated_at: column.text,
  color: column.text,
  category_id: column.integer,
});

const transactions = new Table({
  transaction_id: column.integer,
  user_id: column.text,
  account_id: column.integer,
  category_id: column.integer,
  transaction_type: column.text,
  amount: column.text,
  transaction_date: column.text,
  description: column.text,
  notes: column.text,
  to_account_id: column.integer,
  created_at: column.text,
  updated_at: column.text,
});

export const AppSchema = new Schema({
  accounts,
  categories,
  transactions,
});

export type Database = (typeof AppSchema)['types'];