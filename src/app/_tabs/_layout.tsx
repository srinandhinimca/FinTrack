import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import AppHeader from "../../components/AppHeader";
import { useTheme } from "../../context/ThemeContext";

export default function TabsLayout() {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      {/* Common FinTrack Header */}
      <AppHeader />

      {/* Bottom Tab Navigation */}
      <View style={styles.tabsContainer}>
        <Tabs
          screenOptions={{
            headerShown: false,

            tabBarActiveTintColor: theme.primary,
            tabBarInactiveTintColor: theme.secondaryText,

            tabBarStyle: [
              styles.tabBar,
              {
                backgroundColor: theme.card,
                borderTopColor: theme.border,
              },
            ],

            tabBarLabelStyle: styles.tabBarLabel,
          }}
        >
          <Tabs.Screen
            name="spending"
            options={{
              title: "Spending",
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name="pie-chart-outline"
                  size={size}
                  color={color}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="transactions"
            options={{
              title: "Transactions",
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name="swap-horizontal-outline"
                  size={size}
                  color={color}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="categories"
            options={{
              title: "Categories",
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name="grid-outline"
                  size={size}
                  color={color}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="accounts"
            options={{
              title: "Accounts",
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name="wallet-outline"
                  size={size}
                  color={color}
                />
              ),
            }}
          />
        </Tabs>
        <TouchableOpacity
      style={[
        styles.centerButton,
        {
          backgroundColor: theme.primary,
        },
      ]}
      activeOpacity={0.8}
      onPress={() => {
        // Open Quick Add later
      }}
    >
      <Ionicons
        name="add"
        size={30}
        color="#FFFFFF"
      />
    </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  tabsContainer: {
    flex: 1,
  },

  tabBar: {
  backgroundColor: "#FFFFFF",

  borderWidth: 1,
  borderColor: "#F0F0F0",
  borderTopColor: "#F0F0F0",

  height: 72,

  marginHorizontal: 12,
  marginBottom: 12,

  paddingTop: 6,
  paddingBottom: 10,

  borderRadius: 16,
},

  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
  },

  centerButton: {
    position: "absolute",

    width: 60,
    height: 60,

    borderRadius: 30,

    bottom: 50,
    left: "50%",

    marginLeft: -30,

    alignItems: "center",
    justifyContent: "center",

    elevation: 6,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});