import {
    Pressable,
    StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const {
    mode,
    theme,
    toggleTheme,
  } = useTheme();

  return (
    <Pressable
      onPress={toggleTheme}
      style={[
        styles.button,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <Ionicons
        name={
          mode === "light"
            ? "moon-outline"
            : "sunny-outline"
        }
        size={20}
        color={theme.text}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});