import { column, Schema, Table } from '@powersync/react-native';

const expenses = new Table({
  user_id: column.text,
  account_id: column.text,
  category_id: column.text,
  amount: column.real,
  expense_date: column.text,
  description: column.text,
  notes: column.text,
  created_at: column.text,
  updated_at: column.text,
  deleted_at: column.text,
});

export const AppSchema = new Schema({
  expenses,
});

export type Database = (typeof AppSchema)['types'];
export type ExpenseRecord = Database['expenses'];