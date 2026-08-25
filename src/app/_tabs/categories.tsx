import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type CategoryType = 'expense' | 'income';

type Category = {
  id: string;
  name: string;
  type: CategoryType;
  icon: string | null;
  user_id: string | null;
};

const DEFAULT_ICON = 'pricetag-outline';

export default function CategoriesScreen() {
  const [activeTab, setActiveTab] =
    useState<CategoryType>('expense');

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, [activeTab]);

  const loadCategories = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setCategories([]);
        return;
      }

      const { data, error } = await supabase
        .from('categories')
        .select('id, name, type, icon, user_id')
        .eq('type', activeTab)
        .or(`user_id.is.null,user_id.eq.${user.id}`)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading categories:', error);
        setCategories([]);
        return;
      }

      setCategories(data ?? []);
    } finally {
      setLoading(false);
    }
  };

  const defaultCategories = categories.filter(
    (item) => item.user_id === null
  );

  const myCategories = categories.filter(
    (item) => item.user_id !== null
  );

  const renderCategory = ({ item }: { item: Category }) => (
    <View style={styles.categoryCard}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={(item.icon || DEFAULT_ICON) as any}
          size={24}
        />
      </View>

      <Text style={styles.categoryName}>
        {item.name}
      </Text>

      {item.user_id !== null && (
        <Ionicons
          name="chevron-forward"
          size={20}
          style={styles.arrow}
        />
      )}
    </View>
  );

  const renderSection = (
    title: string,
    data: Category[]
  ) => {
    if (data.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {title}
        </Text>

        {data.map((item) => (
          <View key={item.id}>
            {renderCategory({ item })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Categories
        </Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-category')}
        >
          <Ionicons
            name="add"
            size={22}
          />
        </TouchableOpacity>
      </View>

      {/* Expense / Income Tabs */}
      <View style={styles.tabContainer}>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'expense' &&
              styles.activeTab,
          ]}
          onPress={() =>
            setActiveTab('expense')
          }
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'expense' &&
                styles.activeTabText,
            ]}
          >
            Expense
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'income' &&
              styles.activeTab,
          ]}
          onPress={() =>
            setActiveTab('income')
          }
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'income' &&
                styles.activeTabText,
            ]}
          >
            Income
          </Text>
        </TouchableOpacity>

      </View>

      {/* Category List */}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="small" />
        </View>
      ) : (
        <FlatList
          data={[]}
          keyExtractor={() => 'empty'}
          renderItem={null}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <>
              {renderSection(
                'DEFAULT',
                defaultCategories
              )}

              {renderSection(
                'MY CATEGORIES',
                myCategories
              )}

              {defaultCategories.length === 0 &&
                myCategories.length === 0 && (
                  <View style={styles.empty}>
                    <Ionicons
                      name="folder-open-outline"
                      size={42}
                    />

                    <Text style={styles.emptyTitle}>
                      No {activeTab} categories
                    </Text>

                    <Text style={styles.emptyText}>
                      Add your first {activeTab}{' '}
                      category.
                    </Text>
                  </View>
                )}
            </>
          }
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
  },

  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 9,
  },

  activeTab: {
    backgroundColor: '#FFFFFF',
  },

  tabText: {
    fontSize: 15,
    fontWeight: '500',
  },

  activeTabText: {
    fontWeight: '700',
  },

  list: {
    paddingBottom: 100,
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.55,
    marginBottom: 10,
    letterSpacing: 0.8,
  },

  categoryCard: {
    minHeight: 64,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },

  arrow: {
    opacity: 0.45,
  },

  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  empty: {
    alignItems: 'center',
    paddingTop: 80,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 14,
  },

  emptyText: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 6,
  },
});