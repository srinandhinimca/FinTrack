export type CategoryType = 'expense' | 'income';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
}