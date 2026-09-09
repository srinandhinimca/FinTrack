import AddAccount from '@/components/AddAccount/AddAccount';
import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/context/AuthProvider';
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { Ionicons } from '@expo/vector-icons';
import { Tabs, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const { theme, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [userUuid, setUserUuid] = useState<string | undefined>(undefined);
  const pathname = usePathname();
  const [showAddAccount, setShowAddAccount] = useState(false);

  const isCategoriesPage = pathname.includes('/Categories');
  const isAccountsPage = pathname.includes('/accounts') || pathname.includes('/Accounts');

  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      alert(error.message);
    }
  };

  useEffect(() => {
    async function getUserData() {
      try {
        // Fetch the currently authenticated user
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) throw error;

        if (user) {
          // Check common metadata naming conventions for the user's name
          const name = user.user_metadata?.full_name || user.user_metadata?.name || 'User';
          const userUuid = user.id;
          setUserName(name);
          setUserUuid(userUuid);
        }
      } catch (error) {
        console.error('Error fetching user metadata:', error);
      }
    }

    getUserData();
  }, []);

  const firstLetter = userName ? userName.trim().charAt(0).toUpperCase() : 'U';
  const userId = userUuid ? userUuid : undefined;

  return (
    <>
      <AppHeader
        userName={userName}
        userId={userId}
        avatarText={firstLetter}
        onProfilePress={() => {
          console.log("Profile clicked");
        }}
        onLogoutPress={() => {
          handleSignOut();
        }}
        onAddPress={() => {
          console.log("Add pressed");
          if (isAccountsPage) {
            setShowAddAccount(true);
            return;
          }
        }}
      />

      {/* ─── THIS CONTAINER WRAPS BOTH TABS AND ABSOLUTE OVERLAYS ─── */}
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: theme.primarybg,
              borderTopColor: '#30313e',
              elevation: 0, // Removes Android shadow lines
              // We calculate a base height (e.g., 60px) and add the system inset
              height: 60 + insets.bottom,
              // We add padding at the bottom so the icons/labels sit safely above the navigation pills
              paddingBottom: 5 + insets.bottom,
              paddingTop: 5,
            },
            tabBarActiveTintColor: theme.activeTabBackground,
            tabBarInactiveTintColor: theme.inactiveTabBackground,
            tabBarLabelStyle: {
              fontSize: 9,
            },
          }}
        >
          <Tabs.Screen
            name="Home"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="Transactions"
            options={{
              title: 'Transactions',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="stats-chart-outline" size={size} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="Categories"
            options={{
              title: 'Categories',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="card-outline" size={size} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="Accounts"
            options={{
              title: 'Accounts',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person-outline" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
        </View>

        {showAddAccount && userId && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              backgroundColor: theme.primarybg,
            }}
          >
            <AddAccount
              userId={userId}
              onClose={() => setShowAddAccount(false)}
            />
          </View>
        )}
      
    </>
  );
}
