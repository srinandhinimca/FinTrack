import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

interface AppHeaderProps {
  userName?: string;
  avatarText?: string;
  onProfilePress?: () => void;
  onLogoutPress?: () => void;
  onAddPress?: () => void;
}

export default function AppHeader({
  userName = "User Name",
  avatarText = "U",
  onProfilePress,
  onLogoutPress,
  onAddPress,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const { theme, mode, toggleTheme } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleProfile = () => {
    setMenuVisible(false);
    onProfilePress?.();
  };

  const handleLogout = () => {
    setMenuVisible(false);
    onLogoutPress?.();
  };

  const isDark = mode === "dark";

  return (
    <>
      {/* =========================
          LOGO HEADER
      ========================== */}
      <View
        style={[
          styles.logoHeader,
          {
            backgroundColor: theme.primarybg,
            paddingTop: insets.top + 14,
            paddingBottom: 10,
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <View
            style={[
              styles.logoCircle,
              {
                backgroundColor: theme.primary,
              },
            ]}
          >
            <Ionicons
              name="wallet-outline"
              size={21}
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
      </View>

      {/* =========================
          PROFILE / ADD HEADER
      ========================== */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.primarybg,
            borderBottomColor: theme.border,
          },
        ]}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={[
              styles.avatar,
              {
                borderColor: isDark
                  ? "rgba(255,255,255,0.25)"
                  : "rgba(0,0,0,0.08)",
              },
            ]}
            activeOpacity={0.7}
            onPress={() => setMenuVisible(true)}
          >
            <Text style={styles.avatarText}>{avatarText}</Text>
          </TouchableOpacity>

          <View style={styles.greetingContainer}>
            <Text
              style={[
                styles.goodMorning,
                {
                  color: theme.textSecondary,
                },
              ]}
            >
              Welcome
            </Text>

            <Text
              style={[
                styles.userName,
                {
                  color: theme.text,
                },
              ]}
              numberOfLines={1}
            >
              {userName}
            </Text>
          </View>
        </View>

        {/* Add Button */}
        <TouchableOpacity
          style={[
            styles.addButton,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
          activeOpacity={0.7}
          onPress={onAddPress}
        >
          <Ionicons
            name="add-circle"
            size={30}
            color={theme.primary}
          />
        </TouchableOpacity>
      </View>

      {/* =========================
          PROFILE MENU
      ========================== */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.overlay}>
          <View
            style={[
              styles.fullScreenMenu,
              {
                backgroundColor: theme.primarybg,
                paddingTop: insets.top + 20,
                paddingBottom: insets.bottom + 20,
              },
            ]}
          >
            {/* Top Section */}
            <View style={styles.menuHeaderRow}>
              <View style={styles.menuHeader}>
                <View style={styles.menuAvatar}>
                  <Text style={styles.menuAvatarText}>
                    {avatarText}
                  </Text>
                </View>

                <View>
                  <Text
                    style={[
                      styles.menuUserName,
                      {
                        color: theme.text,
                      },
                    ]}
                  >
                    {userName}
                  </Text>

                  <Text
                    style={[
                      styles.menuSubtitle,
                      {
                        color: theme.textSecondary,
                      },
                    ]}
                  >
                    Account
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setMenuVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.text}
                />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.separator,
                {
                  backgroundColor: theme.border,
                },
              ]}
            />

            {/* Menu Body */}
            <View style={styles.menuBody}>
              {/* Profile */}
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {
                    backgroundColor: theme.surface,
                  },
                ]}
                activeOpacity={0.7}
                onPress={handleProfile}
              >
                <View
                  style={[
                    styles.menuIconContainer,
                    {
                      backgroundColor: theme.primarybg,
                    },
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={theme.text}
                  />
                </View>

                <Text
                  style={[
                    styles.menuText,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  Profile Settings
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>

              {/* Dark Mode */}
              <View
                style={[
                  styles.menuItem,
                  {
                    backgroundColor: theme.surface,
                  },
                ]}
              >
                <View
                  style={[
                    styles.menuIconContainer,
                    {
                      backgroundColor: isDark
                        ? "#1F2937"
                        : "#E2E8F0",
                    },
                  ]}
                >
                  <Ionicons
                    name={isDark ? "moon" : "sunny"}
                    size={20}
                    color={isDark ? "#FFD700" : "#F59E0B"}
                  />
                </View>

                <Text
                  style={[
                    styles.menuText,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  Dark Mode
                </Text>

                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{
                    false: "#CBD5E1",
                    true: theme.primary,
                  }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Logout */}
            <View
              style={[
                styles.menuFooter,
                {
                  borderTopColor: theme.border,
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  styles.logoutItem,
                ]}
                activeOpacity={0.7}
                onPress={handleLogout}
              >
                <View
                  style={[
                    styles.menuIcon,
                    styles.logoutIcon,
                  ]}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={19}
                    color="#FF6B6B"
                  />
                </View>

                <Text
                  style={[
                    styles.menuText,
                    styles.logoutText,
                  ]}
                >
                  Logout
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  /* =========================
     HEADER
  ========================== */

  logoHeader: {
    paddingHorizontal: 20,
  },

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 9,
  },

  logoText: {
    fontSize: 19,
    fontWeight: "700",
  },

  header: {
    minHeight: 76,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#B8A18C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  greetingContainer: {
    flex: 1,
  },

  goodMorning: {
    fontSize: 9,
    marginBottom: 2,
  },

  userName: {
    fontSize: 13,
    fontWeight: "600",
  },

  /* =========================
     ADD BUTTON
  ========================== */

  addButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },

  /* =========================
     MODAL
  ========================== */

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },

  fullScreenMenu: {
    flex: 1,
    paddingHorizontal: 20,
  },

  menuHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  closeButton: {
    padding: 8,
  },

  separator: {
    height: 1,
    marginVertical: 5,
  },

  menuBody: {
    flex: 1,
    marginTop: 20,
    gap: 8,
  },

  menuItem: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderRadius: 12,
  },

  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },

  menuFooter: {
    borderTopWidth: 1,
    paddingTop: 15,
  },

  menuIcon: {
    marginRight: 14,
  },

  menuAvatar: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#B8A18C",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  menuAvatarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  menuUserName: {
    fontSize: 12,
    fontWeight: "600",
  },

  menuSubtitle: {
    fontSize: 9,
    marginTop: 2,
  },

  logoutItem: {
    backgroundColor: "#FF6B6B15",
    marginTop: 8,
  },

  logoutIcon: {
    backgroundColor: "#443136",
  },

  logoutText: {
    color: "#FF6B6B",
  },
});