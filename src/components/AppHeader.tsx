import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
  Pressable,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from "@/context/ThemeContext"

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
  const { width, height } = useWindowDimensions();
  const isSmallScreen = height < 700;
  const [menuVisible, setMenuVisible] = useState(false);

  const handleProfile = () => {
    setMenuVisible(false);
    onProfilePress?.();
  };

  const handleLogout = () => {
    setMenuVisible(false);
    onLogoutPress?.();
  };

  return (
    <>
      <View style={[styles.logoHeader, { backgroundColor: theme.primarybg, paddingTop: 20 + insets.top, paddingBottom: 10 }]}>
        {/* <View
          style={[
            styles.logoContainer,
            {
              marginBottom: isSmallScreen ? 18 : 26,
            },
          ]}
        > */}
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
      <View style={[styles.header, { backgroundColor: theme.primarybg }]}>


        {/* Profile Section */}
        <View style={styles.profileSection}>

          {/* Profile Round Icon */}
          <TouchableOpacity
            style={styles.avatar}
            activeOpacity={0.7}
            onPress={() => setMenuVisible(true)}
          >
            <Text style={styles.avatarText}>
              {avatarText}
            </Text>
          </TouchableOpacity>

          {/* User Information */}
          <View style={styles.greetingContainer}>
            <Text style={styles.goodMorning}>
              Welcome
            </Text>

            <Text
              style={styles.userName}
              numberOfLines={1}
            >
              {userName}
            </Text>
          </View>

        </View>

        {/* Add */}
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.7}
          onPress={onAddPress}
        >
          <Ionicons
            name="add-circle"
            size={30}
            color="#D8D8DF"
          />
        </TouchableOpacity>
      </View>

      {/* Profile Menu */}
      {/* Profile Menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="slide" // Optional change to 'slide' for a smooth mobile-app feel
        onRequestClose={() => setMenuVisible(false)}
      >
        {/* Dark backdrop overlay covering the whole screen */}
        <View style={styles.overlay}>

          {/* Full Screen Menu Container */}
          <View style={[styles.fullScreenMenu, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>

            {/* Top Section: Header & Close Button */}
            <View style={styles.menuHeaderRow}>
              <View style={styles.menuHeader}>
                <View style={styles.menuAvatar}>
                  <Text style={styles.menuAvatarText}>
                    {avatarText}
                  </Text>
                </View>
                <View>
                  <Text style={styles.menuUserName}>
                    {userName}
                  </Text>
                  <Text style={styles.menuSubtitle}>
                    Account
                  </Text>
                </View>
              </View>

              {/* X Close icon on the top right */}
              <TouchableOpacity onPress={() => setMenuVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#D8D8DF" />
              </TouchableOpacity>
            </View>

            <View style={styles.separator} />

            {/* Middle Section: Menu Navigation Items */}
            <View style={styles.menuBody}>

              {/* Option 1: Profile */}
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={handleProfile}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name="person-outline" size={20} color="#D8D8DF" />
                </View>
                <Text style={styles.menuText}>Profile Settings</Text>
                <Ionicons name="chevron-forward" size={17} color="#777888" />
              </TouchableOpacity>


              {/* Option 2: Dark Mode Toggler */}
              <View style={[styles.menuItem, { backgroundColor: theme.surface }]}>
                <View style={[styles.menuIconContainer, { backgroundColor: mode === "dark" ? "#1F2937" : "#E2E8F0" }]}>
                  <Ionicons
                    name={mode === "dark" ? "moon" : "sunny"}
                    size={20}
                    color={mode === "dark" ? "#FFD700" : "#F59E0B"} // Vibrant colors for dark moon & light sun
                  />
                </View>

                <Text style={[styles.menuText, { color: theme.text }]}>
                  Dark Mode
                </Text>

                <Switch
                  value={mode === "dark"} // Correctly matches your context's string value state
                  onValueChange={toggleTheme} // Fires your context's method and handles state automatically
                  trackColor={{ false: "#CBD5E1", true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Option 3: Notifications Link */}
              {/* <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={() => console.log("Notifications pressed")}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name="notifications-outline" size={20} color="#D8D8DF" />
                </View>
                <Text style={styles.menuText}>Notifications</Text>
                <Ionicons name="chevron-forward" size={17} color="#777888" />
              </TouchableOpacity> */}

            </View>
            {/* Bottom Section: Signout Anchored at Bottom */}
            <View style={styles.menuFooter}>
              <TouchableOpacity
                style={[styles.menuItem, styles.logoutItem]}
                activeOpacity={0.7}
                onPress={handleLogout}
              >
                <View style={[styles.menuIcon, styles.logoutIcon]}>
                  <Ionicons
                    name="log-out-outline"
                    size={19}
                    color="#FF6B6B"
                  />
                </View>

                <Text style={[styles.menuText, styles.logoutText]}>
                  Logout
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color="#777888"
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
  header: {
    height: 76,
    paddingHorizontal: 20,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  /* Round Profile Icon */

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,

    backgroundColor: "#B8A18C",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 9,

    borderWidth: 1,
    borderColor: "#FFFFFF55",
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
    color: "#BDBDC7",
    fontSize: 9,
    marginBottom: 2,
  },

  userName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
  },

  logoHeader: {
    paddingLeft: 20,
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


  /* Add Button */

  addButton: {
    width: 50,
    height: 50,

    borderRadius: 8,

    backgroundColor: "#333440",

    justifyContent: "center",
    alignItems: "center",

    marginLeft: 10,
  },

  /* Menu */

  /* Overlay background layer */
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Darkened behind overlay
  },

  /* NEW: Replaces menuContainer layout entirely */
  fullScreenMenu: {
    flex: 1,
    backgroundColor: "#1F202C", // Base primary theme color for whole screen modal
    paddingHorizontal: 20,
  },

  menuHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  closeButton: {
    padding: 8,
  },

  /* NEW: Tells body contents to stretch and fill the remaining center screen area */
  menuBody: {
    flex: 1,
    marginTop: 20,
    gap: 8, // Adds structural breathing room directly between menu listing rows
  },

  menuItem: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#292A37", // Slightly lighter row card background
    paddingHorizontal: 14,
    borderRadius: 12,
  },

  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#333440",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  menuText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },

  /* NEW: Forces logout items down into bottom structural boundary container */
  menuFooter: {
    borderTopWidth: 1,
    borderTopColor: "#41424F",
    paddingTop: 15,
  },



  menuIcon: {
    marginRight: 14,
  },



  menuContainer: {
    position: "absolute",

    top: 68,
    left: 18,

    width: 235,

    backgroundColor: "#30313F",

    borderRadius: 12,

    paddingVertical: 10,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.35,
    shadowRadius: 10,

    elevation: 10,
  },

  menuHeader: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 14,
    paddingVertical: 8,
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
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  menuSubtitle: {
    color: "#8F909D",
    fontSize: 9,
    marginTop: 2,
  },

  separator: {
    height: 1,
    backgroundColor: "#41424F",

    marginVertical: 5,
  },


  logoutItem: {
    // Adds visual contrast separating the signout button from common profile links
    backgroundColor: '#FF6B6B15',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 8,
  },

  logoutIcon: {
    backgroundColor: "#443136",
  },

  logoutText: {
    color: "#FF6B6B",
  },
});