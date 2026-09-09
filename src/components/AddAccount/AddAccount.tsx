import { useTheme } from "@/context/ThemeContext";
//import { supabase } from "@/lib/supabase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { usePowerSync } from '@powersync/react-native';
import * as Crypto from 'expo-crypto';
//import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


const ACCOUNT_COLORS = [
  "#147D74", // Blue-green (selected by default)
  "#5F4BB6", // Purple
  "#5EAF62", // Green
  "#FA9F42", // Orange
  "#F25F5C", // Red
  "#3A86C8", // Blue
  "#B5BAC2", // Gray
];

const CURRENCY_OPTIONS = [
  "INR - Indian Rupee",
  "USD - US Dollar",
  "EUR - Euro",
  "GBP - British Pound",
  "JPY - Japanese Yen"
];



interface AddAccountProps {
  userId?: string;
  onClose: () => void;
}

export default function AddAccountScreen({ userId, onClose }: AddAccountProps) {
  const insets = useSafeAreaInsets();
  
  const { theme, mode } = useTheme();

  // Form State
  const [accountName, setAccountName] = useState("");
  const [currency, setCurrency] = useState("INR - Indian Rupee");
  const [openingBalance, setOpeningBalance] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState("#147D74");
  //const [showAddAccount, setShowAddAccount] = useState(false);

  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  const db = usePowerSync();
 
  
// const { data: { user } } = await supabase.auth.getUser();
// const validUserId = user?.id; 

const handleSave = async () => {
  if (!userId) {
    console.error("User ID is required to save an account");
    return;
  }

  if (!accountName.trim()) {
    alert("Please enter an account name");
    return;
  }

  try {
    const newAccountId = Crypto.randomUUID();

    await db.execute(
      `
        INSERT INTO accounts (
          id,
          user_id,
          name,
          opening_balance,
          currency,
          color
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        newAccountId,
        userId,
        accountName.trim(),
        parseFloat(openingBalance) || 0,
        currency,
        selectedColor,
      ]
    );

    console.log("Account saved successfully:", newAccountId);

    onClose();
  } catch (error) {
    console.error("Error saving account:", error);
    alert("Failed to save account");
  }
};

  

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.primarybg, paddingTop: insets.top }]}
    >
      {/* 1. Header Bar */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          // style={[styles.iconButton, { backgroundColor: mode === "dark" ? "#1F2937" : "#F1F5F9" }]}
          style={[styles.iconButton, { backgroundColor: theme.primarybg }]}
          onPress={onClose}
        >
          <Ionicons name="close" size={22} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Add Account</Text>
          <View style={styles.subtitleRow}>
            <Ionicons name="wallet" size={12} color={theme.primary} style={{ marginRight: 4 }} />
            <Text style={[styles.headerSubtitle, { color: theme.secondaryText }]}>Expense Tracker</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={handleSave}>
          <Ionicons name="checkmark" size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        {/* 2. Banner Prompt */}
        {/* <View style={[styles.bannerCard, { backgroundColor: mode === "dark" ? "#1E293B" : "#F8FAFC", borderColor: theme.border }]}> */}
          <View style={[styles.bannerCard, { backgroundColor: theme.primarybg, borderColor: theme.border }]}>
          <View style={[styles.bannerIconCircle, { backgroundColor: mode === "dark" ? "#334155" : "#EFF6FF" }]}>
          
            <Ionicons name="information-circle" size={18} color={theme.primary} />
          </View>
          <View style={styles.bannerTextContainer}>
            <Text style={[styles.bannerTitle, { color: theme.text }]}>Create a new account</Text>
            <Text style={[styles.bannerSubtitle, { color: theme.secondaryText }]}>
              Add a new account to track your expenses and balance
            </Text>
          </View>
          <MaterialCommunityIcons name="wallet-plus-outline" size={42} color={mode === "dark" ? "#475569" : "#DBEAFE"} style={styles.bannerGraphic} />
        </View>

        {/* 3. Dynamic Form Field Body */}
        <View style={[styles.formContainer, { backgroundColor: theme.primarybg, borderColor: theme.border }]}>

          {/* Account Name */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <View style={[styles.fieldIconCircle, { backgroundColor: "#EFF6FF" }]}><Ionicons name="wallet-outline" size={16} color="#3B82F6" /></View>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Account Name <Text style={styles.required}>*</Text></Text>
            </View>
            <View style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
              <Ionicons name="person-outline" size={18} color={theme.secondaryText} style={styles.fieldLeftIcon} />
              <TextInput
                style={[styles.textInput, { color: theme.text }]}
                placeholder="e.g., Personal, Vacation"
                placeholderTextColor={theme.secondaryText}
                value={accountName}
                onChangeText={setAccountName}
              />
            </View>
          </View>

          {/* Currency Dropdown Row */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <View style={[styles.fieldIconCircle, { backgroundColor: "#F3E8FF" }]}><MaterialCommunityIcons name="currency-inr" size={16} color="#A855F7" /></View>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Currency <Text style={styles.required}>*</Text></Text>
            </View>
            <TouchableOpacity
              style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}
              activeOpacity={0.7}
              onPress={() => setCurrencyModalVisible(true)}
            >
              <Text style={[styles.dropdownText, { color: theme.text }]}>{currency}</Text>
              <Ionicons name="chevron-down" size={18} color={theme.secondaryText} />
            </TouchableOpacity>
          </View>

          {/* Opening Balance Field */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <View style={[styles.fieldIconCircle, { backgroundColor: "#DCFCE7" }]}><Ionicons name="card-outline" size={16} color="#22C55E" /></View>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Opening Balance</Text>
            </View>
            <View style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
              <Text style={[styles.currencyPrefix, { color: theme.text }]}>₹</Text>
              <TextInput
                style={[styles.textInput, { color: theme.text }]}
                placeholder="0.00"
                placeholderTextColor={theme.secondaryText}
                keyboardType="numeric"
                value={openingBalance}
                onChangeText={setOpeningBalance}
              />
            </View>
          </View>

          {/* Optional Description Notes Block */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <View style={[styles.fieldIconCircle, { backgroundColor: "#FEF9C3" }]}><Ionicons name="document-text-outline" size={16} color="#EAB308" /></View>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Description (Optional)</Text>
            </View>
            <View style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
              <TextInput
                style={[styles.textInput, { color: theme.text }]}
                placeholder="Add notes about this account"
                placeholderTextColor={theme.secondaryText}
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>

          {/* Theme Color Picker Row Grid */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <View style={[styles.fieldIconCircle, { backgroundColor: "#FCE7F3" }]}><Ionicons name="color-palette-outline" size={16} color="#EC4899" /></View>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Account Colour</Text>
            </View>
            <View style={styles.colorPaletteRow}>
              {ACCOUNT_COLORS.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <TouchableOpacity
                    key={color}
                    style={[styles.colorCircle, { backgroundColor: color }]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedColor(color)}
                  >
                    {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

        </View>

        {/* 4. Bottom Security Shield Message Row */}
        {/* <View style={[styles.securityCard, { backgroundColor: mode === "dark" ? "#14532D40" : "#F0FDF4", borderColor: mode === "dark" ? "#166534" : "#DCFCE7" }]}>
          <View style={styles.securityIconCircle}>
            <Ionicons name="shield-checkmark" size={18} color="#22C55E" />
          </View>
          <View style={styles.securityTextContainer}>
            <Text style={[styles.securityTitle, { color: mode === "dark" ? "#4ADE80" : "#166534" }]}>Your data is safe</Text>
            <Text style={[styles.securitySubtitle, { color: mode === "dark" ? "#86EFAC" : "#15803D" }]}>
              All accounts and transactions are stored securely on your device.
            </Text>
          </View>
        </View> */}

      </ScrollView>


      <Modal
        visible={currencyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Dismiss backdrop hit area */}
          <TouchableOpacity
            style={styles.modalDismissArea}
            activeOpacity={1}
            onPress={() => setCurrencyModalVisible(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: theme.card, paddingBottom: insets.bottom + 16 }]}>

            {/* Drag handle pill */}
            <View style={[styles.modalIndicator, { backgroundColor: theme.border }]} />

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Currency</Text>
              <TouchableOpacity onPress={() => setCurrencyModalVisible(false)} style={styles.modalCloseIconHitbox}>
                <Ionicons name="close" size={22} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* Currency Selector List Options */}
            <FlatList
              data={CURRENCY_OPTIONS}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = currency === item;
                return (
                  <TouchableOpacity
                    style={[
                      styles.currencyItem,
                      { borderBottomColor: theme.border },
                      isSelected && { backgroundColor: mode === "dark" ? "#1F2937" : "#F1F5F9" }
                    ]}
                    activeOpacity={0.6}
                    onPress={() => {
                      setCurrency(item);
                      setCurrencyModalVisible(false);
                    }}
                  >
                    <Text style={[
                      styles.currencyItemText,
                      { color: theme.text },
                      isSelected && { fontWeight: "600", color: theme.primary }
                    ]}>
                      {item}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>




        </View>
      </Modal>

    </KeyboardAvoidingView>

   
   

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,

    fontWeight: "700",
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: "500",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  bannerCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    position: "relative",
    overflow: "hidden",
  },
  bannerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  bannerTextContainer: {
    flex: 1,
    paddingRight: 40,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  bannerGraphic: {
    position: "absolute",
    right: 12,
    bottom: 12,
  },
  formContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 18,
    marginBottom: 20,
  },
  inputGroup: {
    width: "100%",
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  fieldIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  required: {
    color: "#EF4444",
  },
  inputWrapper: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  fieldLeftIcon: {
    marginRight: 8,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: "500",
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
  },
  dropdownText: {
    flex: 1,
    fontSize: 14,
  },
  colorPaletteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    paddingHorizontal: 4,
  },
  colorCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  securityCard: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  securityIconCircle: {
    marginRight: 10,
    marginTop: 2,
  },
  securityTextContainer: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  securitySubtitle: {
    fontSize: 11,
    lineHeight: 15,
  },

  /* Background backdrop overlay covering the whole screen */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end", // Anchors sheet to the bottom of screen
  },

  /* Empty top touch area to dismiss sheet when tapping outside */
  modalDismissArea: {
    flex: 1,
  },

  /* Bottom sheet paper panel container layout */
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "55%",
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  /* Horizontal drag indicator pill accent bar */
  modalIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 15,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  modalCloseIconHitbox: {
    padding: 4,
  },

  /* Individual listing element item rows */
  currencyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    marginVertical: 1,
  },

  currencyItemText: {
    fontSize: 14,
    fontWeight: "500",
  },
});





