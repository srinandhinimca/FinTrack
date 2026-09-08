import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { createAccount } from "@/services/accountService";

const ACCOUNT_COLORS = [
  "#147D74",
  "#5F4BB6",
  "#5EAF62",
  "#FA9F42",
  "#F25F5C",
  "#3A86C8",
  "#B5BAC2",
];

const CURRENCY_OPTIONS = [
  "INR - Indian Rupee",
  "USD - US Dollar",
  "EUR - Euro",
  "GBP - British Pound",
  "JPY - Japanese Yen",
];

interface AddAccountProps {
  onClose?: () => void;
  onDone?: () => void;
}

export default function AddAccount({
  onClose,
  onDone,
}: AddAccountProps) {
  const { theme } = useTheme();

  // =========================================
  // FORM STATE
  // =========================================

  const [accountName, setAccountName] = useState("");

  const [currency, setCurrency] = useState(
    "INR - Indian Rupee"
  );

  const [openingBalance, setOpeningBalance] =
    useState("");

  const [selectedColor, setSelectedColor] =
    useState(ACCOUNT_COLORS[0]);

  const [showCurrencies, setShowCurrencies] =
    useState(false);

  const [saving, setSaving] = useState(false);

  // =========================================
  // SAVE ACCOUNT
  // =========================================

  const handleSave = async () => {
  const name = accountName.trim();

  if (!name) {
    Alert.alert(
      "Account Name",
      "Please enter an account name."
    );
    return;
  }

  const balance =
    openingBalance.trim() === ""
      ? 0
      : Number(openingBalance);

  if (Number.isNaN(balance)) {
    Alert.alert(
      "Opening Balance",
      "Please enter a valid amount."
    );
    return;
  }

  try {
    setSaving(true);

    // Save account to Supabase
    await createAccount({
      name,
      openingBalance: balance,
      currency,
      color: selectedColor,
    });

    console.log("Account created successfully");

    // Tell layout that account was saved
    onDone?.();

  } catch (error: any) {
    console.error(
      "Failed to create account:",
      error
    );

    Alert.alert(
      "Error",
      error?.message ||
        "Failed to create account."
    );
  } finally {
    setSaving(false);
  }
};

  // =========================================
  // SCREEN
  // =========================================

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* =================================
            HEADER
        ================================= */}

        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={onClose}
            disabled={saving}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={32}
              color={theme.text}
            />
          </Pressable>

          <Text
            style={[
              styles.headerTitle,
              {
                color: theme.text,
              },
            ]}
          >
            Add Account
          </Text>

          <View style={styles.headerRight} />
        </View>

        {/* =================================
            INFORMATION CARD
        ================================= */}

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.infoIcon,
              {
                backgroundColor: theme.primarybg,
              },
            ]}
          >
            <Ionicons
              name="wallet-outline"
              size={21}
              color={theme.primary}
            />
          </View>

          <View style={styles.infoContent}>
            <Text
              style={[
                styles.infoTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Create a new account
            </Text>

            <Text
              style={[
                styles.infoText,
                {
                  color: theme.secondaryText,
                },
              ]}
            >
              Add an account to track your balance
              and expenses.
            </Text>
          </View>
        </View>

        {/* =================================
            ACCOUNT NAME
        ================================= */}

        <View style={styles.section}>
          <Text
            style={[
              styles.label,
              {
                color: theme.text,
              },
            ]}
          >
            Account Name{" "}
            <Text style={styles.required}>*</Text>
          </Text>

          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor:
                  theme.inputBackground,
                borderColor: theme.border,
              },
            ]}
          >
            <Ionicons
              name="wallet-outline"
              size={20}
              color={theme.secondaryText}
            />

            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                },
              ]}
              placeholder="e.g. Personal, Office"
              placeholderTextColor={
                theme.secondaryText
              }
              value={accountName}
              onChangeText={setAccountName}
              editable={!saving}
            />
          </View>
        </View>

        {/* =================================
            CURRENCY
        ================================= */}

        <View style={styles.section}>
          <Text
            style={[
              styles.label,
              {
                color: theme.text,
              },
            ]}
          >
            Currency{" "}
            <Text style={styles.required}>*</Text>
          </Text>

          <Pressable
            style={[
              styles.inputWrapper,
              {
                backgroundColor:
                  theme.inputBackground,
                borderColor: theme.border,
              },
            ]}
            onPress={() =>
              setShowCurrencies(!showCurrencies)
            }
            disabled={saving}
          >
            <MaterialCommunityIcons
              name="currency-inr"
              size={20}
              color={theme.secondaryText}
            />

            <Text
              style={[
                styles.currencyText,
                {
                  color: theme.text,
                },
              ]}
            >
              {currency}
            </Text>

            <Ionicons
              name={
                showCurrencies
                  ? "chevron-up"
                  : "chevron-down"
              }
              size={18}
              color={theme.secondaryText}
            />
          </Pressable>

          {/* Currency Options */}
          {showCurrencies && (
            <View
              style={[
                styles.currencyList,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
            >
              {CURRENCY_OPTIONS.map((item) => {
                const selected =
                  currency === item;

                return (
                  <Pressable
                    key={item}
                    style={[
                      styles.currencyOption,
                      {
                        borderBottomColor:
                          theme.border,
                      },
                    ]}
                    onPress={() => {
                      setCurrency(item);
                      setShowCurrencies(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.currencyOptionText,
                        {
                          color: selected
                            ? theme.primary
                            : theme.text,
                        },
                      ]}
                    >
                      {item}
                    </Text>

                    {selected && (
                      <Ionicons
                        name="checkmark"
                        size={19}
                        color={theme.primary}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* =================================
            OPENING BALANCE
        ================================= */}

        <View style={styles.section}>
          <Text
            style={[
              styles.label,
              {
                color: theme.text,
              },
            ]}
          >
            Opening Balance
          </Text>

          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor:
                  theme.inputBackground,
                borderColor: theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.currencyPrefix,
                {
                  color: theme.text,
                },
              ]}
            >
              ₹
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                },
              ]}
              placeholder="0.00"
              placeholderTextColor={
                theme.secondaryText
              }
              keyboardType="decimal-pad"
              value={openingBalance}
              onChangeText={setOpeningBalance}
              editable={!saving}
            />
          </View>
        </View>

        {/* =================================
            ACCOUNT COLOUR
        ================================= */}

        <View style={styles.section}>
          <Text
            style={[
              styles.label,
              {
                color: theme.text,
              },
            ]}
          >
            Choose Colour
          </Text>

          <View style={styles.colorPalette}>
            {ACCOUNT_COLORS.map((color) => {
              const selected =
                selectedColor === color;

              return (
                <Pressable
                  key={color}
                  style={[
                    styles.colorOption,
                    {
                      backgroundColor: color,
                      borderColor: selected
                        ? theme.primary
                        : theme.border,
                    },
                  ]}
                  onPress={() =>
                    setSelectedColor(color)
                  }
                  disabled={saving}
                >
                  {selected && (
                    <MaterialCommunityIcons
                      name="check"
                      size={18}
                      color="#FFFFFF"
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* =================================
            SAVE ACCOUNT
        ================================= */}

        <Pressable
          style={[
            styles.saveButton,
            {
              backgroundColor: theme.primary,
              opacity: saving ? 0.6 : 1,
            },
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color={theme.primaryText}
            style={{ marginRight: 7 }}
          />

          <Text
            style={[
              styles.saveButtonText,
              {
                color: theme.primaryText,
              },
            ]}
          >
            {saving
              ? "Saving Account..."
              : "Save Account"}
          </Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// =========================================
// STYLES
// =========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 30,
  },

  // =======================================
  // HEADER
  // =======================================

  header: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  headerRight: {
    width: 40,
    height: 40,
  },

  // =======================================
  // INFORMATION CARD
  // =======================================

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 22,
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },

  infoText: {
    fontSize: 12,
    lineHeight: 17,
  },

  // =======================================
  // FORM
  // =======================================

  section: {
    marginBottom: 20,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },

  required: {
    color: "#EF4444",
  },

  inputWrapper: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  input: {
    flex: 1,
    height: 46,
    fontSize: 14,
    marginLeft: 9,
  },

  currencyText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 9,
  },

  currencyPrefix: {
    fontSize: 17,
    fontWeight: "600",
    marginRight: 7,
  },

  // =======================================
  // CURRENCY LIST
  // =======================================

  currencyList: {
    borderWidth: 1,
    borderRadius: 9,
    marginTop: 6,
    overflow: "hidden",
  },

  currencyOption: {
    minHeight: 46,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth:
      StyleSheet.hairlineWidth,
  },

  currencyOptionText: {
    fontSize: 13,
  },

  // =======================================
  // COLOUR
  // =======================================

  colorPalette: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 3,
    paddingTop: 4,
  },

  colorOption: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },

  // =======================================
  // SAVE BUTTON
  // =======================================

  saveButton: {
    height: 50,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 4,
  },

  saveButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});