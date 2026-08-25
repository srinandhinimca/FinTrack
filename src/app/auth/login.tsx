import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import ThemeToggle from "../../components/ThemeToggle";
import { useAuth } from "../../context/AuthProvider";
import { useTheme } from "../../context/ThemeContext";

export default function Login() {
  const { theme } = useTheme();

  // Supabase authentication
  const { signIn, loading } = useAuth();

  const { width, height } = useWindowDimensions();

  const isWeb = Platform.OS === "web";
  const isSmallScreen = height < 700;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    // Email validation
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    // Password validation
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      // Login through AuthProvider
      await signIn(email.trim(), password);

      // Login successful
      router.replace("/_tabs/spending");
    } catch (err: any) {
      console.error("Login error:", err);

      setError(
        err?.message || "Invalid email or password."
      );
    }
  };

  return (
    <View
      style={[
        styles.safeArea,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios" ? "padding" : undefined
        }
      >
        <View
          style={[
            styles.page,
            {
              width: isWeb ? Math.min(width - 32, 480) : "100%",
              paddingHorizontal: isSmallScreen ? 18 : 24,
              paddingTop: isSmallScreen ? 8 : 18,
              paddingBottom: isSmallScreen ? 8 : 18,
            },
          ]}
        >
          {/* Theme Toggle */}

          <View style={styles.topBar}>
            <ThemeToggle />
          </View>

          {/* Logo */}

          <View
            style={[
              styles.logoContainer,
              {
                marginBottom: isSmallScreen ? 18 : 26,
              },
            ]}
          >
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

          {/* Heading */}

          <Text
            style={[
              styles.title,
              {
                color: theme.text,
                fontSize: isSmallScreen ? 27 : 31,
                lineHeight: isSmallScreen ? 31 : 36,
              },
            ]}
          >
            Sign in to your{"\n"}Account
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: theme.secondaryText,
                marginBottom: isSmallScreen ? 17 : 22,
              },
            ]}
          >
            Enter your email and password to log in
          </Text>

          {/* Email */}

          <Text
            style={[
              styles.label,
              {
                color: theme.text,
              },
            ]}
          >
            Email
          </Text>

          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.inputBackground,
                borderColor: error
                  ? theme.error
                  : theme.border,
              },
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={18}
              color={theme.secondaryText}
            />

            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                },
              ]}
              placeholder="laura@example.com"
              placeholderTextColor={theme.secondaryText}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError("");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}

          <Text
            style={[
              styles.label,
              {
                color: theme.text,
              },
            ]}
          >
            Password
          </Text>

          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.inputBackground,
                borderColor: error
                  ? theme.error
                  : theme.border,
              },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={theme.secondaryText}
            />

            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                },
              ]}
              placeholder="••••••••"
              placeholderTextColor={theme.secondaryText}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError("");
              }}
              secureTextEntry={!showPassword}
            />

            <Pressable
              onPress={() =>
                setShowPassword(!showPassword)
              }
              hitSlop={10}
            >
              <Ionicons
                name={
                  showPassword
                    ? "eye-outline"
                    : "eye-off-outline"
                }
                size={19}
                color={theme.secondaryText}
              />
            </Pressable>
          </View>

          {/* Error */}

          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons
                name="alert-circle-outline"
                size={14}
                color={theme.error}
              />

              <Text
                style={[
                  styles.errorText,
                  {
                    color: theme.error,
                  },
                ]}
              >
                {error}
              </Text>
            </View>
          ) : null}

          {/* Forgot Password */}

          <Pressable
            style={[
              styles.forgotContainer,
              {
                marginBottom: isSmallScreen ? 12 : 16,
              },
            ]}
          >
            <Text
              style={[
                styles.forgotText,
                {
                  color: theme.primary,
                },
              ]}
            >
              Forgot Password ?
            </Text>
          </Pressable>

          {/* Login */}

          <Pressable
            style={[
              styles.loginButton,
              {
                backgroundColor: theme.primary,
                opacity: loading ? 0.6 : 1,
              },
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? "Signing In..." : "Log In"}
            </Text>
          </Pressable>

          {/* Divider */}

          <View
            style={[
              styles.dividerContainer,
              {
                marginVertical: isSmallScreen ? 9 : 12,
              },
            ]}
          >
            <View
              style={[
                styles.divider,
                {
                  backgroundColor: theme.divider,
                },
              ]}
            />

            <Text
              style={[
                styles.orText,
                {
                  color: theme.secondaryText,
                },
              ]}
            >
              Or
            </Text>

            <View
              style={[
                styles.divider,
                {
                  backgroundColor: theme.divider,
                },
              ]}
            />
          </View>

          {/* Google */}

          <Pressable
            style={[
              styles.socialButton,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={styles.googleText}>G</Text>

            <Text
              style={[
                styles.socialText,
                {
                  color: theme.text,
                },
              ]}
            >
              Sign in with Google
            </Text>
          </Pressable>

          {/* Apple */}

          <Pressable
            style={[
              styles.socialButton,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <Ionicons
              name="logo-apple"
              size={18}
              color={theme.text}
            />

            <Text
              style={[
                styles.socialText,
                {
                  color: theme.text,
                },
              ]}
            >
              Sign in with Apple
            </Text>
          </Pressable>

          {/* Register */}

          <View style={styles.registerContainer}>
            <Text
              style={[
                styles.registerText,
                {
                  color: theme.secondaryText,
                },
              ]}
            >
              Don't have an account?{" "}
            </Text>

            <Pressable
              onPress={() =>
                router.push("/auth/register")
              }
            >
              <Text
                style={[
                  styles.registerLink,
                  {
                    color: theme.primary,
                  },
                ]}
              >
                Sign Up
              </Text>
            </Pressable>
          </View>

          {/* Bottom safe space */}

          <View style={styles.bottomSpace} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  page: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
    justifyContent: "flex-start",
  },

  topBar: {
    height: 40,
    alignItems: "flex-end",
    justifyContent: "center",
    marginBottom: 2,
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

  title: {
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 7,
  },

  label: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 4,
  },

  inputContainer: {
    height: 45,
    borderWidth: 1,
    borderRadius: 7,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 10,
  },

  input: {
    flex: 1,
    fontSize: 13,
    marginLeft: 9,
    paddingVertical: 0,
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -4,
    marginBottom: 7,
  },

  errorText: {
    fontSize: 10,
    marginLeft: 4,
  },

  forgotContainer: {
    alignItems: "flex-end",
  },

  forgotText: {
    fontSize: 10,
    fontWeight: "600",
  },

  loginButton: {
    height: 45,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  divider: {
    flex: 1,
    height: 1,
  },

  orText: {
    marginHorizontal: 9,
    fontSize: 10,
  },

  socialButton: {
    height: 40,
    borderWidth: 1,
    borderRadius: 6,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 7,
  },

  googleText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#4285F4",
    marginRight: 7,
  },

  socialText: {
    fontSize: 10,
    fontWeight: "500",
    marginLeft: 7,
  },

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  registerText: {
    fontSize: 9,
  },

  registerLink: {
    fontSize: 9,
    fontWeight: "700",
  },

  bottomSpace: {
    height: 4,
  },
});