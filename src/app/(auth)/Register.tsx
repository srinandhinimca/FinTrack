import {  Alert, KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View, } from 'react-native'
import { useState } from 'react'
import InputField from '@/components/Forms/InputField'
import PrimaryButton from '@/components/Button/PrimaryButton'
import { useAuth } from '@/context/AuthProvider'
import ThemeToggle from "../../components/ThemeToggle";
import { useTheme } from "../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const RegisterScreen = () => {
  const { theme } = useTheme();
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

    const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");

  const { signUp } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Please enter the complete register details")
      return;
    }
    if(password!==confirmPassword){
      Alert.alert("Passwords do not match")
      return;
    }
    try {
      await signUp(email, password, name)
      alert("Success,Account created")
    } catch (error: any) {
      Alert.alert("Registration Failed",error.message)
    }
  }

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
        <View style={styles.page}>

          {/* Theme Toggle */}

          <View style={styles.topBar}>
            <ThemeToggle />
          </View>

          {/* Logo */}

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

          {/* Heading */}

          <Text
            style={[
              styles.title,
              {
                color: theme.text,
              },
            ]}
          >
            Create your{"\n"}Account
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: theme.secondaryText,
              },
            ]}
          >
            Create an account to start managing your finances
          </Text>

          {/* Name */}

          <Text
            style={[
              styles.label,
              {
                color: theme.text,
              },
            ]}
          >
            Full Name
          </Text>

          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
              },
            ]}
          >
            <Ionicons
              name="person-outline"
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
              placeholder="Enter your name"
              placeholderTextColor={theme.secondaryText}
              value={name}
              onChangeText={(text) => {
                setName(text);
                setError("");
              }}
              autoCapitalize="words"
            />
          </View>

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
                borderColor: theme.border,
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

          {/* Confirm Password */}

          <Text
            style={[
              styles.label,
              {
                color: theme.text,
              },
            ]}
          >
            Confirm Password
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
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setError("");
              }}
              secureTextEntry={!showConfirmPassword}
            />

            <Pressable
              onPress={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
              hitSlop={10}
            >
              <Ionicons
                name={
                  showConfirmPassword
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

          {/* Register Button */}

          <Pressable
            style={[
              styles.registerButton,
              {
                backgroundColor: theme.primary,
              },
            ]}
            onPress={handleRegister}
          >
            <Text style={styles.registerButtonText}>
              Create Account
            </Text>
          </Pressable>

          {/* Login */}

          <View style={styles.loginContainer}>
            <Text
              style={[
                styles.loginText,
                {
                  color: theme.secondaryText,
                },
              ]}
            >
              Already have an account?{" "}
            </Text>

            <Pressable
              onPress={() =>
                router.push("/(auth)/Login")
              }
            >
              <Text
                style={[
                  styles.loginLink,
                  {
                    color: theme.primary,
                  },
                ]}
              >
                Sign In
              </Text>
            </Pressable>
          </View>

        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

export default RegisterScreen

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
    maxWidth: 500,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 15,
  },

  topBar: {
    height: 38,
    alignItems: "flex-end",
    justifyContent: "center",
    marginBottom: 3,
  },

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
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
    fontSize: 29,
    lineHeight: 34,
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
    marginBottom: 15,
  },

  label: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 5,
    marginTop: 3,
  },

  inputContainer: {
    height: 43,
    borderWidth: 1,
    borderRadius: 7,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 7,
  },

  input: {
    flex: 1,
    fontSize: 12,
    marginLeft: 9,
    paddingVertical: 0,
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 1,
    marginBottom: 7,
  },

  errorText: {
    fontSize: 10,
    marginLeft: 4,
  },

  registerButton: {
    height: 44,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },

  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },

  loginText: {
    fontSize: 10,
  },

  loginLink: {
    fontSize: 10,
    fontWeight: "700",
  },
});