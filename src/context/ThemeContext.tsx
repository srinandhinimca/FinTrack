import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
    darkTheme,
    lightTheme,
} from "../utils/theme";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  theme: typeof lightTheme;
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<
  ThemeContextType | undefined
>(undefined);

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme =
        await AsyncStorage.getItem("fintrack-theme");

      if (savedTheme === "dark") {
        setMode("dark");
      }
    } catch (error) {
      console.log("Unable to load theme", error);
    }
  };

  const toggleTheme = async () => {
    const newMode =
      mode === "light" ? "dark" : "light";

    setMode(newMode);

    try {
      await AsyncStorage.setItem(
        "fintrack-theme",
        newMode
      );
    } catch (error) {
      console.log("Unable to save theme", error);
    }
  };

  const theme =
    mode === "light"
      ? lightTheme
      : darkTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        mode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}