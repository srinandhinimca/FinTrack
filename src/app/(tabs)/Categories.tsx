import { useTheme } from '@/context/ThemeContext';
import {
  CategoryProvider,
  useCategory,
} from '@/context/CategoryContext';
import { Category, CategoryType } from '@/models/Category';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// =========================================
// CATEGORIES SCREEN
// =========================================

export default function Categories() {
  return (
    <CategoryProvider>
      <CategoriesContent />
    </CategoryProvider>
  );
}

// =========================================
// CATEGORIES CONTENT
// =========================================

function CategoriesContent() {
  const { theme } = useTheme();

  const categoryContext = useCategory();
  const { refresh } = useLocalSearchParams<{ refresh?: string }>();

  if (!categoryContext) {
    return null;
  }

  useEffect(() => {
  if (refresh) {
    categoryContext?.refreshCategories();
  }
}, [refresh]);

  const {
    categories: allCategories,
    loading,
  } = categoryContext;

  // =========================================
  // SELECTED TAB
  // =========================================

  const [categoryType, setCategoryType] =
    useState<CategoryType>('expense');

  // =========================================
  // FILTER CATEGORIES
  // =========================================

  const expenseCategories: Category[] =
    allCategories.filter(
      (category) => category.type === 'expense'
    );

  const incomeCategories: Category[] =
    allCategories.filter(
      (category) => category.type === 'income'
    );

  // =========================================
  // SELECT CURRENT ARRAY
  // =========================================

  const categories =
    categoryType === 'expense'
      ? expenseCategories
      : incomeCategories;

  // =========================================
  // SCREEN
  // =========================================

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <View
        style={[
          styles.content,
          {
            backgroundColor: theme.card,
          },
        ]}
      >
        {/* =================================
            TITLE
        ================================= */}

        <View style={styles.titleRow}>
          <Text
            style={[
              styles.title,
              {
                color: theme.text,
              },
            ]}
          >
            Categories
          </Text>
        </View>

        {/* =================================
            EXPENSE / INCOME TABS
        ================================= */}

        <View
          style={[
            styles.tabContainer,
            {
              borderColor: theme.primary,
            },
          ]}
        >
          {/* =================================
              EXPENSES TAB
          ================================= */}

          <Pressable
            style={[
              styles.tab,
              {
                backgroundColor:
                  categoryType === 'expense'
                    ? theme.primary
                    : theme.card,
              },
            ]}
            onPress={() =>
              setCategoryType('expense')
            }
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    categoryType === 'expense'
                      ? theme.primaryText
                      : theme.primary,
                },
              ]}
            >
              Expenses
            </Text>
          </Pressable>

          {/* =================================
              INCOME TAB
          ================================= */}

          <Pressable
            style={[
              styles.tab,
              {
                backgroundColor:
                  categoryType === 'income'
                    ? theme.primary
                    : theme.card,
              },
            ]}
            onPress={() =>
              setCategoryType('income')
            }
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    categoryType === 'income'
                      ? theme.primaryText
                      : theme.primary,
                },
              ]}
            >
              Income
            </Text>
          </Pressable>
        </View>

        {/* =================================
            CATEGORY LIST
        ================================= */}

        <ScrollView
          style={styles.categoryList}
          contentContainerStyle={
            styles.categoryListContent
          }
          showsVerticalScrollIndicator={false}
        >
          {/* =================================
              LOADING
          ================================= */}

          {loading && (
            <View style={styles.emptyContainer}>
              <Text
                style={[
                  styles.emptyText,
                  {
                    color: theme.text,
                  },
                ]}
              >
                Loading categories...
              </Text>
            </View>
          )}

          {/* =================================
              CATEGORY ROWS
          ================================= */}

          {!loading &&
            categories.map((category) => (
              <Pressable
                key={category.id}
                style={[
                  styles.categoryRow,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => {
                  console.log(
                    'Selected category:',
                    category.name
                  );
                }}
              >
                {/* ===============================
                    CATEGORY ICON
                =============================== */}

                <View
                  style={[
                    styles.categoryIcon,
                    {
                      backgroundColor:
                        category.color ??
                        theme.primary,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={
                      (category.icon ||
                        'shape-outline') as keyof typeof MaterialCommunityIcons.glyphMap
                    }
                    size={21}
                    color={theme.text}
                  />
                </View>

                {/* ===============================
                    CATEGORY NAME
                =============================== */}

                <Text
                  style={[
                    styles.categoryName,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  {category.name}
                </Text>
              </Pressable>
            ))}

          {/* =================================
              EMPTY STATE
          ================================= */}

          {!loading &&
            categories.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text
                  style={[
                    styles.emptyText,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  No {categoryType} categories found.
                </Text>
              </View>
            )}
        </ScrollView>
      </View>
    </View>
  );
}

// =========================================
// STYLES
// =========================================

const styles = StyleSheet.create({
  // =======================================
  // MAIN CONTAINER
  // =======================================

  container: {
    flex: 1,
  },

  // =======================================
  // CONTENT
  // =======================================

  content: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 8,
  },

  // =======================================
  // TITLE
  // =======================================

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
  },

  // =======================================
  // EXPENSE / INCOME TABS
  // =======================================

  tabContainer: {
    height: 46,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    marginTop: 14,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // =======================================
  // CATEGORY LIST
  // =======================================

  categoryList: {
    flex: 1,
    marginTop: 12,
  },

  categoryListContent: {
    paddingBottom: 90,
  },

  // =======================================
  // CATEGORY ROW
  // =======================================

  categoryRow: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 7,
    marginBottom: 6,
  },

  // =======================================
  // CATEGORY ICON
  // =======================================

  categoryIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  // =======================================
  // CATEGORY NAME
  // =======================================

  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },

  // =======================================
  // EMPTY / LOADING STATE
  // =======================================

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },

  emptyText: {
    fontSize: 14,
    opacity: 0.6,
  },
});