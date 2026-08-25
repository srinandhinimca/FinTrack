import { Ionicons } from "@expo/vector-icons";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function AppHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <View
      style={[
        styles.headerContainer,
        {
          backgroundColor: theme.card,
        },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.card,
          },
        ]}
      >
        {/* Logo and App Name */}
        <View style={styles.logoSection}>
          <View
            style={[
              styles.logo,
              {
                backgroundColor: theme.primary,
              },
            ]}
          >
            <Ionicons
              name="wallet-outline"
              size={18}
              color="#FFFFFF"
            />
          </View>

          <Text
            style={[
              styles.logoText,
              {
                color: theme.text,
              },
            ]}
          >
            FinTrack
          </Text>
        </View>

        {/* Theme Button */}
        <TouchableOpacity
          style={[
            styles.themeButton,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
          activeOpacity={0.7}
          onPress={toggleTheme}
        >
          <Ionicons
            name={
              theme.background === "#F5F5F3"
                ? "moon-outline"
                : "sunny-outline"
            }
            size={20}
            color={theme.text}
          />
        </TouchableOpacity>
      </View>

      {/* Thin line below header */}
      <View
        style={[
          styles.divider,
          {
            backgroundColor: theme.border,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
  },

  header: {
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  logoSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  logoText: {
    fontSize: 18,
    fontWeight: "700",
  },

  themeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  divider: {
    height: 1,
    width: "100%",
  },
});