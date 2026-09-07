import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from "@/context/ThemeContext"

interface HeaderProps {
  userName?: string;
  avatarText?: string;
  onProfilePress?: () => void;
  onLogoutPress?: () => void;
  onAddPress?: () => void;
}


export default function Header({
  userName = "User Name",
  avatarText = "U",
   onProfilePress,
  onLogoutPress,
  onAddPress,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
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
      <View style={[styles.logoHeader, {backgroundColor: theme.primarybg, paddingTop: 20 + insets.top }]}>
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
    <View style={styles.header}>


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
          style={[styles.addButton, { backgroundColor: theme.addButtonBackground }]}
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
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        {/* Dark overlay */}
        <Pressable
          style={styles.overlay}
          onPress={() => setMenuVisible(false)}
        >
          {/* Menu */}
          <Pressable style={styles.menuContainer}>

            {/* Menu Header */}
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

            <View style={styles.separator} />

            {/* Profile */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={handleProfile}
            >
              <View style={styles.menuIcon}>
                <Ionicons
                  name="person-outline"
                  size={19}
                  color="#D8D8DF"
                />
              </View>

              <Text style={styles.menuText}>
                Profile
              </Text>

              <Ionicons
                name="chevron-forward"
                size={17}
                color="#777888"
              />
            </TouchableOpacity>

            {/* Logout */}
            <TouchableOpacity
              style={styles.menuItem}
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
                color="#777888"
              />
            </TouchableOpacity>

          </Pressable>
        </Pressable>
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

  logoHeader:{
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

    justifyContent: "center",
    alignItems: "center",

    marginLeft: 10,
  },

  /* Overlay */

  overlay: {
    flex: 1,

    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },

  /* Menu */

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

  /* Menu Items */

  menuItem: {
    height: 48,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 12,
  },

  menuIcon: {
    width: 32,
    height: 32,

    borderRadius: 16,

    backgroundColor: "#3A3B48",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 11,
  },

  logoutIcon: {
    backgroundColor: "#443136",
  },

  menuText: {
    flex: 1,

    color: "#E3E3E7",

    fontSize: 12,
  },

  logoutText: {
    color: "#FF6B6B",
  },
});