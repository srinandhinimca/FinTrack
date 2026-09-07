import {
  column,
  Schema,
  Table,
} from '@powersync/common';

const accounts = new Table(
  {
    id: column.text,
    user_id: column.text,
    account_id: column.integer,
    name: column.text,
    opening_balance: column.real,
    currency: column.text,
    color: column.text,
    created_at: column.text,
    updated_at: column.text,
  },
  {
    localOnly: false,
  }
);

const categories = new Table(
  {
    user_id: column.text,
    category_id: column.integer,
    name: column.text,
    icon: column.text,
    created_at: column.text,
    updated_at: column.text,
    color: column.text,
    category_type: column.text,
    category_type_id: column.integer,
  },
  {
    localOnly: false,
  }
);

const profiles = new Table(
  {
    full_name: column.text,
    username: column.text,
    avatar_url: column.text,
    phone: column.text,
    currency: column.text,
    timezone: column.text,
    is_active: column.text,
    created_at: column.text,
    updated_at: column.text,
  },
  {
    localOnly: false,
  }
);

const transactions = new Table(
  {
    user_id: column.text,
    account_id: column.integer,
    category_type_id: column.integer,
    category_id: column.integer,
    transaction_type_id: column.integer,
    transaction_type: column.text,
    description: column.text,
    amount: column.real,
    transaction_date: column.text,
    created_at: column.text,
    updated_at: column.text,
  },
  {
    localOnly: false,
  }
);

export const AppSchema = new Schema({
  accounts,
  categories,
  profiles,
  transactions,
});

export type AppSchemaType = typeof AppSchema;