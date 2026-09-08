import { supabase } from '@/lib/supabase';
import {
  Category,
  CategoryType,
} from '@/models/Category';

// =========================================
// GET CATEGORIES
// =========================================

export async function getCategories(): Promise<Category[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error('User is not logged in');
  }

  const { data, error } = await supabase
    .from('categories')
    .select(
      `
      id,
      user_id,
      name,
      icon,
      created_at,
      type,
      updated_at,
      color
      `
    )
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as Category[];
}

// =========================================
// CREATE CATEGORY
// =========================================

export async function createCategory(category: {
  name: string;
  type: CategoryType;
  icon?: string | null;
  color?: string | null;
}): Promise<Category> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error('User is not logged in');
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_id: user.id,
      name: category.name.trim(),
      type: category.type,
      icon: category.icon ?? null,
      color: category.color ?? null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Category;
}

// =========================================
// UPDATE CATEGORY
// =========================================

export async function updateCategory(
  id: string,
  category: {
    name: string;
    type: CategoryType;
    icon?: string | null;
    color?: string | null;
  }
): Promise<Category> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error('User is not logged in');
  }

  const { data, error } = await supabase
    .from('categories')
    .update({
      name: category.name.trim(),
      type: category.type,
      icon: category.icon ?? null,
      color: category.color ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Category;
}

// =========================================
// DELETE CATEGORY
// =========================================

export async function deleteCategory(
  id: string
): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error('User is not logged in');
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw error;
  }
}