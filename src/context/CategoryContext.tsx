import { createContext, useContext, useEffect, useState } from 'react';
import { Category } from '@/models/Category';
import { getCategories } from '@/services/categoryService';

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  refreshCategories: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | null>(null);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshCategories = async () => {
  try {
    setLoading(true);

    const data = await getCategories();

    setCategories(data);
  } catch (error) {
    console.error('Failed to load categories:', error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
    refreshCategories();
  }, []);

  return (
    <CategoryContext.Provider value={{ categories, loading, refreshCategories }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategory() {
  return useContext(CategoryContext);
}