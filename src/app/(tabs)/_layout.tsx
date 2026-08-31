import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#292a37',
          borderTopColor: '#30313e',
          height: 60,
          paddingBottom: 7,
          paddingTop: 5,
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#777888',
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
  );
}