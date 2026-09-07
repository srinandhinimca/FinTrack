import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '@/components/AppHeader';
import { View } from 'react-native';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from 'react';
import { useTheme } from "@/context/ThemeContext";

export default function TabsLayout() {
  const { theme, mode } = useTheme();
   const insets = useSafeAreaInsets();
   const [userName, setUserName] = useState<string | undefined>(undefined);
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
               setUserName(name);
             }
           } catch (error) {
             console.error('Error fetching user metadata:', error);
           } finally {
             //setLoading(false);
           }
         }
     
         getUserData();
       }, []);

       const firstLetter = userName ? userName.trim().charAt(0).toUpperCase() : 'U';
  return (
    <>
    <AppHeader  userName={userName}
          avatarText={firstLetter}
          onProfilePress={() => {
            console.log("Profile clicked");
          }}
          onLogoutPress={() => {
            handleSignOut();
          }}
          onAddPress={() => {
            console.log("Add pressed");
          }}/>

    <View style={{ flex: 1 }}>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.primarybg,
          borderTopColor: '#30313e',
            elevation: 0, // Removes Android shadow lines
            // ─── THE CRITICAL FIX FOR ANDROID SYSTEM BARS ───
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
            <Ionicons
              name="home"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="stats-chart-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="card-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Accounts"
        options={{
          title: 'Accounts',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
    </View>
    
    </>
    
  );
}