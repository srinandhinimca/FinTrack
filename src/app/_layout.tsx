import { Stack } from "expo-router";

import { AuthProvider } from "../context/AuthProvider";
import { ThemeProvider } from "../context/ThemeContext";
import { PowerSyncProvider } from "../providers/PowerSyncProvider";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PowerSyncProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="auth" />
            <Stack.Screen name="_tabs" />
          </Stack>
        </PowerSyncProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}