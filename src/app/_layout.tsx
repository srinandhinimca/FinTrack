import { Stack } from "expo-router";

import { AuthProvider } from "../context/AuthProvider";
import { ThemeProvider } from "../context/ThemeContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="auth" />
          <Stack.Screen name="tabs" />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}