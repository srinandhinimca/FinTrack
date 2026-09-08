import AddCategory from '@/components/AddCategory/AddCategory';
import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/context/AuthProvider';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import { createCategory } from '@/services/categoryService';
import { Ionicons } from '@expo/vector-icons';
import { router, Tabs, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { theme } = useTheme();

  const [userName, setUserName] =
    useState<string | undefined>(undefined);

  const [showAddCategory, setShowAddCategory] =
    useState(false);

  const { signOut } = useAuth();

  // =========================================
  // LOGOUT
  // =========================================

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      alert(error.message);
    }
  };

  // =========================================
  // GET USER DATA
  // =========================================

  useEffect(() => {
    async function getUserData() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) throw error;

        if (user) {
          const name =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            'User';

          setUserName(name);
        }
      } catch (error) {
        console.error(
          'Error fetching user metadata:',
          error
        );
      }
    }

    getUserData();
  }, []);

  // =========================================
  // USER AVATAR
  // =========================================

  const firstLetter = userName
    ? userName.trim().charAt(0).toUpperCase()
    : 'U';

  // =========================================
  // CHECK CURRENT PAGE
  // =========================================

  const isCategoriesPage =
    pathname.includes('/Categories');

  // =========================================
  // MAIN LAYOUT
  // =========================================

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.primarybg,
      }}
    >
      {/* =====================================
          MAIN HEADER
      ===================================== */}

      <AppHeader
        userName={userName}
        avatarText={firstLetter}

        onProfilePress={() => {
          console.log('Profile clicked');
        }}

        onLogoutPress={() => {
          handleSignOut();
        }}

        onAddPress={() => {
          console.log('Add pressed');

          // =================================
          // OPEN ADD CATEGORY OVERLAY
          // =================================

          if (isCategoriesPage) {
            console.log(
              'Opening Add Category overlay'
            );

            setShowAddCategory(true);
          }
        }}
      />

      {/* =====================================
          TAB NAVIGATION
      ===================================== */}

      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,

            tabBarStyle: {
              backgroundColor: theme.primarybg,
              borderTopColor: theme.border,

              elevation: 0,

              height:
                60 + insets.bottom,

              paddingBottom:
                5 + insets.bottom,

              paddingTop: 4,
            },
            tabBarItemStyle: {
      alignItems: 'center',
      justifyContent: 'center',
    },

            tabBarActiveTintColor: theme.primary,
tabBarInactiveTintColor: theme.secondaryText,

            tabBarLabelStyle: {
              fontSize: 10,
              fontWeight: 500,
            },
          }}
        >
          {/* =================================
              HOME
          ================================= */}

          <Tabs.Screen
            name="Home"
            options={{
              title: 'Home',

              tabBarIcon: ({
                color,
                size,
              }) => (
                <Ionicons
                  name="home"
                  size={size + 3}
                  color={color}
                />
              ),
            }}
          />

          {/* =================================
              TRANSACTIONS
          ================================= */}

          <Tabs.Screen
            name="Transactions"
            options={{
              title: 'Transactions',

              tabBarIcon: ({
                color,
                size,
              }) => (
                <Ionicons
                  name="stats-chart-outline"
                  size={size + 3}
                  color={color}
                />
              ),
            }}
          />

          {/* =================================
              CATEGORIES
          ================================= */}

          <Tabs.Screen
            name="Categories"
            options={{
              title: 'Categories',

              tabBarIcon: ({
                color,
                size,
              }) => (
                <Ionicons
                  name="card-outline"
                  size={size + 3}
                  color={color}
                />
              ),
            }}
          />

          {/* =================================
              ACCOUNTS
          ================================= */}

          <Tabs.Screen
            name="Accounts"
            options={{
              title: 'Accounts',

              tabBarIcon: ({
                color,
                size,
              }) => (
                <Ionicons
                  name="person-outline"
                  size={size + 3}
                  color={color}
                />
              ),
            }}
          />
        </Tabs>
      </View>

      {/* =====================================
          ADD CATEGORY OVERLAY
      ===================================== */}

      {showAddCategory && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#292a37',
            zIndex: 1000,
          }}
        >
          <AddCategory
            onClose={() => {
              setShowAddCategory(false);
            }}

            onDone={async (category) => {
  try {
    console.log('Saving category:', category);

    const savedCategory = await createCategory({
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
    });

    console.log(
      'Category saved:',
      savedCategory
    );

    setShowAddCategory(false);
    router.replace({
      pathname: pathname,
      params: {
        refresh: Date.now().toString(),
      },
    });
  } catch (error: any) {
    console.error(
      'Error saving category:',
      error
    );

    alert(
      error?.message ||
      'Failed to save category.'
    );
  }
}}
          />
        </View>
      )}
    </View>
  );
}