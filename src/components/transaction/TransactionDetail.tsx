import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { createTransaction } from "@/services/transactionService";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet,
    Text, TextInput, View,
} from "react-native";

type Account = {
  account_id: number;
  name: string;
  currency: string;
  color: string | null;
};

type Category = {
  category_id: number;
  name: string;
  icon: string | null;
  color: string | null;
  type: string | null;
};

type TransactionDetailProps = {
  onClose: () => void;
  onSaved: () => void;
};

export default function TransactionDetail({
  onClose,
  onSaved,
}: TransactionDetailProps) {
  const { theme } = useTheme();

  // =========================================
  // TRANSACTION TYPE
  // =========================================

  const [transactionType, setTransactionType] =
    useState<"expense" | "income">("expense");

  // =========================================
  // DATA
  // =========================================

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // =========================================
  // SELECTED VALUES
  // =========================================

  const [selectedAccount, setSelectedAccount] =
    useState<Account | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null);

  const [transactionDate, setTransactionDate] =
    useState(formatDateForDatabase(new Date()));

  // =========================================
  // INPUT VALUES
  // =========================================

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  // =========================================
  // MODALS
  // =========================================

  const [showCategoryModal, setShowCategoryModal] =
    useState(false);

  const [showAccountModal, setShowAccountModal] =
    useState(false);

  const [showDateModal, setShowDateModal] =
    useState(false);

  // =========================================
  // STATUS
  // =========================================

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {
    loadInitialData();
  }, []);

  // =========================================
  // LOAD CATEGORIES WHEN TYPE CHANGES
  // =========================================

  useEffect(() => {
    loadCategories();
  }, [transactionType]);

  // =========================================
  // LOAD INITIAL DATA
  // =========================================

  async function loadInitialData() {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("User not found.");
      }

      // ---------------------------------------
      // LOAD ACCOUNTS
      // ---------------------------------------

      const {
        data: accountData,
        error: accountError,
      } = await supabase
        .from("accounts")
        .select(
          "account_id, name, currency, color"
        )
        .eq("user_id", user.id)
        .order("account_id", {
          ascending: true,
        });

      if (accountError) {
        throw accountError;
      }

      const loadedAccounts =
        (accountData || []) as Account[];

      setAccounts(loadedAccounts);

      // First account becomes default account
      if (loadedAccounts.length > 0) {
        setSelectedAccount(loadedAccounts[0]);
      }

      // ---------------------------------------
      // LOAD CATEGORIES
      // ---------------------------------------

      await loadCategories();
    } catch (error: any) {
      console.error(
        "Error loading transaction data:",
        error
      );

      Alert.alert(
        "Error",
        error?.message ||
          "Failed to load transaction data."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================
  // LOAD CATEGORIES
  // =========================================

  async function loadCategories() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from("categories")
        .select(
          "category_id, name, icon, color, type"
        )
        .eq("user_id", user.id)
        .order("category_id", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      const allCategories =
        (data || []) as Category[];

      const filteredCategories =
        allCategories.filter((category) => {
          if (!category.type) {
            return true;
          }

          const type =
            category.type.toLowerCase();

          if (transactionType === "expense") {
            return type === "expense";
          }

          if (transactionType === "income") {
            return type === "income";
          }

          return true;
        });

      setCategories(filteredCategories);

      // Clear category if it does not
      // belong to the selected transaction type.
      if (
        selectedCategory &&
        !filteredCategories.some(
          (category) =>
            category.category_id ===
            selectedCategory.category_id
        )
      ) {
        setSelectedCategory(null);
      }
    } catch (error: any) {
      console.error(
        "Error loading categories:",
        error
      );
    }
  }

  // =========================================
  // CHANGE TRANSACTION TYPE
  // =========================================

  function handleTransactionTypeChange(
    type: "expense" | "income"
  ) {
    setTransactionType(type);
    setSelectedCategory(null);
  }

  // =========================================
  // CURRENCY SYMBOL
  // =========================================

  function getCurrencySymbol(
    currency: string | null | undefined
  ) {
    if (!currency) {
      return "₹";
    }

    const value = currency.trim();

    const currencyMap: Record<string, string> = {
      INR: "₹",
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      CNY: "¥",
      AUD: "A$",
      CAD: "C$",
      SGD: "S$",
      AED: "د.إ",
      SAR: "﷼",
    };

    const code = value
      .split("-")[0]
      .trim()
      .toUpperCase();

    return (
      currencyMap[code] ||
      code ||
      "₹"
    );
  }

  const currencySymbol = useMemo(() => {
    return getCurrencySymbol(
      selectedAccount?.currency
    );
  }, [selectedAccount]);

  // =========================================
  // AMOUNT
  // =========================================

  function formatAmount(value: string) {
    let cleaned = value.replace(
      /[^0-9.]/g,
      ""
    );

    const firstDot =
      cleaned.indexOf(".");

    if (firstDot !== -1) {
      cleaned =
        cleaned.substring(
          0,
          firstDot + 1
        ) +
        cleaned
          .substring(firstDot + 1)
          .replace(/\./g, "");
    }

    return cleaned;
  }

  function handleAmountChange(
    value: string
  ) {
    setAmount(formatAmount(value));
  }

  // =========================================
  // DATE
  // =========================================

  function formatDisplayDate(
    date: string
  ) {
    const parsed = new Date(
      `${date}T00:00:00`
    );

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function getDateOptions() {
    const today = new Date();

    return Array.from(
      { length: 31 },
      (_, index) => {
        const date = new Date(today);

        date.setDate(
          today.getDate() - index
        );

        return formatDateForDatabase(
          date
        );
      }
    );
  }

  // =========================================
  // DONE / VALIDATE / SAVE
  // =========================================

  async function handleDone() {
    const cleanAmount = amount
      .replace(/,/g, "")
      .trim();

    // ---------------------------------------
    // CATEGORY VALIDATION
    // ---------------------------------------

    if (!selectedCategory) {
      Alert.alert(
        "Category",
        "Please select a category."
      );

      return;
    }

    // ---------------------------------------
    // AMOUNT VALIDATION
    // ---------------------------------------

    if (!cleanAmount) {
      Alert.alert(
        "Amount",
        "Please enter an amount."
      );

      return;
    }

    const numericAmount =
      Number(cleanAmount);

    if (
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount <= 0
    ) {
      Alert.alert(
        "Amount",
        "Please enter a valid amount."
      );

      return;
    }

    // ---------------------------------------
    // ACCOUNT VALIDATION
    // ---------------------------------------

    if (!selectedAccount) {
      Alert.alert(
        "Account",
        "Please select an account."
      );

      return;
    }

    // ---------------------------------------
    // SAVE
    // ---------------------------------------

    try {
      setSaving(true);

      await createTransaction({
        account_id: selectedAccount.account_id,
        category_id: selectedCategory.category_id,
        transaction_type: transactionType,
        amount: numericAmount,
        transaction_date: transactionDate,
        description: null,
        notes: note.trim() || null,
        to_account_id: null,
      });

      onSaved();
    } catch (error: any) {
      console.error(
        "Error saving transaction:",
        error
      );

      Alert.alert(
        "Error",
        error?.message ||
          "Failed to save transaction."
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================
  // LOADING SCREEN
  // =========================================

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {
            backgroundColor:
              theme.primarybg ||
              theme.background,
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={theme.primary}
        />
      </View>
    );
  }

  // =========================================
  // SCREEN
  // =========================================

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.primarybg ||
            theme.background,
        },
      ]}
    >
      {/* =====================================
          HEADER
      ===================================== */}

      <View style={styles.header}>
        <Pressable
          onPress={onClose}
          style={styles.backButton}
          hitSlop={10}
        >
          <Ionicons
            name="arrow-back"
            size={25}
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
          Transaction Details
        </Text>

        <View
          style={styles.headerSpacer}
        />
      </View>

      {/* =====================================
          EXPENSE / INCOME
      ===================================== */}

      <View
        style={styles.typeContainer}
      >
        <View
          style={[
            styles.typeSelector,
            {
              borderColor:
                theme.primary,
              backgroundColor:
                theme.card,
            },
          ]}
        >
          {/* EXPENSE */}

          <Pressable
            onPress={() =>
              handleTransactionTypeChange(
                "expense"
              )
            }
            style={[
              styles.typeButton,
              transactionType ===
                "expense" && {
                backgroundColor:
                  theme.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.typeButtonText,
                {
                  color:
                    transactionType ===
                    "expense"
                      ? theme.primaryText
                      : theme.primary,
                },
              ]}
            >
              EXPENSE
            </Text>
          </Pressable>

          {/* INCOME */}

          <Pressable
            onPress={() =>
              handleTransactionTypeChange(
                "income"
              )
            }
            style={[
              styles.typeButton,
              {
                borderLeftWidth: 1,
                borderLeftColor: theme.border,
              },
              transactionType ===
                "income" && {
                backgroundColor:
                  theme.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.typeButtonText,
                {
                  color:
                    transactionType ===
                    "income"
                      ? theme.primaryText
                      : theme.primary,
                },
              ]}
            >
              INCOME
            </Text>
          </Pressable>
        </View>
      </View>

      {/* =====================================
          TRANSACTION DETAILS HEADER
      ===================================== */}

      <View
        style={[
          styles.sectionHeader,
          {
            backgroundColor:
              theme.card,
            borderBottomColor:
              theme.border,
          },
        ]}
      >
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.text,
            },
          ]}
        >
          Transaction Details
        </Text>

        <Ionicons
          name="help-circle-outline"
          size={17}
          color={
            theme.secondaryText
          }
        />
      </View>

      {/* =====================================
          INPUT SECTION
      ===================================== */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.scrollContent
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* ===================================
            DATE
        =================================== */}

        <Pressable
          onPress={() =>
            setShowDateModal(true)
          }
          style={[
            styles.detailRow,
            {
              backgroundColor:
                theme.card,
              borderBottomColor:
                theme.border,
            },
          ]}
        >
          <View style={styles.rowLabelContainer}>
            <Text
              style={[
                styles.rowLabel,
                {
                  color: theme.text,
                },
              ]}
            >
              Date
            </Text>
          </View>

          <View style={styles.rowValueContainer}>
            <Text
              style={[
                styles.rowValue,
                {
                  color: theme.text,
                },
              ]}
            >
              {formatDisplayDate(
                transactionDate
              )}
            </Text>
          </View>

          <View style={styles.rowChevronContainer}>
  <Ionicons
    name="chevron-forward"
    size={18}
    color={theme.secondaryText}
  />
</View>
        </Pressable>

        {/* ===================================
            CATEGORY
        =================================== */}

        <Pressable
          onPress={() =>
            setShowCategoryModal(
              true
            )
          }
          style={[
            styles.detailRow,
            {
              backgroundColor:
                theme.card,
              borderBottomColor:
                theme.border,
            },
          ]}
        >
          <View style={styles.rowLabelContainer}>
            <Text
              style={[
                styles.rowLabel,
                {
                  color: theme.text,
                },
              ]}
            >
              Category
            </Text>
          </View>

          <View
            style={styles.rowValueContainer}
          >
            {selectedCategory?.icon ? (
              <View
                style={[
                  styles.categoryIcon,
                  {
                    backgroundColor:
                      `${
                        selectedCategory.color ||
                        theme.primary
                      }20`,
                  },
                ]}
              >
                <Ionicons
                  name={
                    selectedCategory.icon as any
                  }
                  size={15}
                  color={
                    selectedCategory.color ||
                    theme.primary
                  }
                />
              </View>
            ) : null}

            <Text
              style={[
                styles.rowValue,
                {
                  color:
                    selectedCategory
                      ? theme.text
                      : theme.secondaryText,
                },
              ]}
              numberOfLines={1}
            >
              {selectedCategory?.name ||
                "Not Selected"}
            </Text>
          </View>

          <View style={styles.rowChevronContainer}>
  <Ionicons
    name="chevron-forward"
    size={18}
    color={theme.secondaryText}
  />
</View>
        </Pressable>

        {/* ===================================
            AMOUNT
        =================================== */}

        <View
          style={[
            styles.detailRow,
            {
              backgroundColor:
                theme.card,
              borderBottomColor:
                theme.border,
            },
          ]}
        >
          <View style={styles.rowLabelContainer}>
            <Text
              style={[
                styles.rowLabel,
                {
                  color: theme.text,
                },
              ]}
            >
              Amount
            </Text>
          </View>

          <View
            style={styles.amountInputContainer}
          >
            <Text
              style={[
                styles.currencySymbol,
                {
                  color: theme.text,
                },
              ]}
            >
              {currencySymbol}
            </Text>

            <TextInput
              value={amount}
              onChangeText={
                handleAmountChange
              }
              placeholder="Amount"
              placeholderTextColor={
                theme.secondaryText
              }
              keyboardType="decimal-pad"
              style={[
                styles.amountInput,
                {
                  color: theme.text,
                },
              ]}
            />
          </View>
        </View>

        {/* ===================================
            ACCOUNT
        =================================== */}

        <Pressable
          onPress={() =>
            setShowAccountModal(
              true
            )
          }
          style={[
            styles.detailRow,
            {
              backgroundColor:
                theme.card,
              borderBottomColor:
                theme.border,
            },
          ]}
        >
          <View style={styles.rowLabelContainer}>
            <Text
              style={[
                styles.rowLabel,
                {
                  color: theme.text,
                },
              ]}
            >
              Account
            </Text>
          </View>

          <View style={styles.rowValueContainer}>
            <Text
              style={[
                styles.rowValue,
                {
                  color: selectedAccount
                    ? theme.text
                    : theme.secondaryText,
                },
              ]}
              numberOfLines={1}
            >
              {selectedAccount?.name ||
                "Not Selected"}
            </Text>
          </View>

          <View style={styles.rowChevronContainer}>
  <Ionicons
    name="chevron-forward"
    size={18}
    color={theme.secondaryText}
  />
</View>
        </Pressable>

        {/* ===================================
            NOTE
        =================================== */}

        <View
          style={[
            styles.noteRow,
            {
              backgroundColor:
                theme.card,
              borderBottomColor:
                theme.border,
            },
          ]}
        >
          <View style={styles.rowLabelContainer}>
            <Text
              style={[
                styles.rowLabel,
                {
                  color: theme.text,
                },
              ]}
            >
              Note
            </Text>
          </View>

          <View style={styles.rowValueContainer}>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="No Note Entered"
              placeholderTextColor={
                theme.secondaryText
              }
              style={[
                styles.noteInput,
                {
                  color: theme.text,
                },
              ]}
              multiline={false}
            />
          </View>
        </View>

        {/* ===================================
            DONE BUTTON
            ALWAYS VISIBLE
        =================================== */}

        <View
          style={styles.doneWrapper}
        >
          <Pressable
            onPress={handleDone}
            disabled={saving}
            style={[
              styles.doneButton,
              {
                backgroundColor:
                  theme.primary,
                opacity: saving
                  ? 0.6
                  : 1,
              },
            ]}
          >
            {saving ? (
              <ActivityIndicator
                size="small"
                color={
                  theme.primaryText
                }
              />
            ) : (
              <Text
                style={[
                  styles.doneButtonText,
                  {
                    color:
                      theme.primaryText,
                  },
                ]}
              >
                Done
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      {/* =====================================
          CATEGORY MODAL
      ===================================== */}

      <Modal
        visible={
          showCategoryModal
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowCategoryModal(
            false
          )
        }
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setShowCategoryModal(
              false
            )
          }
        >
          <Pressable
            style={[
              styles.modalCard,
              {
                backgroundColor:
                  theme.card,
              },
            ]}
            onPress={() => {}}
          >
            <Text
              style={[
                styles.modalTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Select Category
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              style={styles.modalList}
            >
              {categories.length ===
              0 ? (
                <Text
                  style={[
                    styles.emptyText,
                    {
                      color:
                        theme.secondaryText,
                    },
                  ]}
                >
                  No categories available
                </Text>
              ) : (
                categories.map(
                  (category) => (
                    <Pressable
                      key={
                        category.category_id
                      }
                      onPress={() => {
                        setSelectedCategory(
                          category
                        );

                        setShowCategoryModal(
                          false
                        );
                      }}
                      style={[
                        styles.modalItem,
                        {
                          borderBottomColor:
                            theme.border,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.modalIcon,
                          {
                            backgroundColor:
                              `${
                                category.color ||
                                theme.primary
                              }20`,
                          },
                        ]}
                      >
                        <Ionicons
                          name={
                            (category.icon ||
                              "pricetag-outline") as any
                          }
                          size={19}
                          color={
                            category.color ||
                            theme.primary
                          }
                        />
                      </View>

                      <Text
                        style={[
                          styles.modalItemText,
                          {
                            color:
                              theme.text,
                          },
                        ]}
                      >
                        {
                          category.name
                        }
                      </Text>

                      {selectedCategory
                        ?.category_id ===
                      category.category_id ? (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color={
                            theme.primary
                          }
                        />
                      ) : null}
                    </Pressable>
                  )
                )
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* =====================================
          ACCOUNT MODAL
      ===================================== */}

      <Modal
        visible={
          showAccountModal
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowAccountModal(
            false
          )
        }
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setShowAccountModal(
              false
            )
          }
        >
          <Pressable
            style={[
              styles.modalCard,
              {
                backgroundColor:
                  theme.card,
              },
            ]}
            onPress={() => {}}
          >
            <Text
              style={[
                styles.modalTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Select Account
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              style={styles.modalList}
            >
              {accounts.map(
                (account) => (
                  <Pressable
                    key={
                      account.account_id
                    }
                    onPress={() => {
                      setSelectedAccount(
                        account
                      );

                      setShowAccountModal(
                        false
                      );
                    }}
                    style={[
                      styles.modalItem,
                      {
                        borderBottomColor:
                          theme.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.modalIcon,
                        {
                          backgroundColor:
                            `${
                              account.color ||
                              theme.primary
                            }20`,
                        },
                      ]}
                    >
                      <Ionicons
                        name="wallet-outline"
                        size={19}
                        color={
                          account.color ||
                          theme.primary
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.accountModalContent
                      }
                    >
                      <Text
                        style={[
                          styles.modalItemText,
                          {
                            color:
                              theme.text,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {
                          account.name
                        }
                      </Text>

                      <Text
                        style={[
                          styles.currencyText,
                          {
                            color:
                              theme.secondaryText,
                          },
                        ]}
                      >
                        {getCurrencySymbol(
                          account.currency
                        )}
                      </Text>
                    </View>

                    {selectedAccount
                      ?.account_id ===
                    account.account_id ? (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={
                          theme.primary
                        }
                      />
                    ) : null}
                  </Pressable>
                )
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* =====================================
          DATE MODAL
      ===================================== */}

      <Modal
        visible={
          showDateModal
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowDateModal(
            false
          )
        }
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setShowDateModal(
              false
            )
          }
        >
          <Pressable
            style={[
              styles.modalCard,
              {
                backgroundColor:
                  theme.card,
              },
            ]}
            onPress={() => {}}
          >
            <Text
              style={[
                styles.modalTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Select Date
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              style={styles.modalList}
            >
              {getDateOptions().map(
                (date) => (
                  <Pressable
                    key={date}
                    onPress={() => {
                      setTransactionDate(
                        date
                      );

                      setShowDateModal(
                        false
                      );
                    }}
                    style={[
                      styles.modalItem,
                      {
                        borderBottomColor:
                          theme.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={
                        theme.primary
                      }
                    />

                    <Text
                      style={[
                        styles.modalItemText,
                        {
                          color:
                            theme.text,
                        },
                      ]}
                    >
                      {formatDisplayDate(
                        date
                      )}
                    </Text>

                    {transactionDate ===
                    date ? (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={
                          theme.primary
                        }
                      />
                    ) : null}
                  </Pressable>
                )
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// =========================================
// DATE FORMAT
// =========================================

function formatDateForDatabase(
  date: Date
) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// =========================================
// STYLES
// =========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // =======================================
  // HEADER
  // =======================================

  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },

  backButton: {
    width: 36,
    height: 36,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
  },

  headerSpacer: {
    width: 36,
  },

  // =======================================
  // EXPENSE / INCOME
  // =======================================

  typeContainer: {
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },

  typeSelector: {
  height: 38,
  width: 180,
  borderWidth: 1,
  borderRadius: 6,
  flexDirection: "row",
  overflow: "hidden",
},

  typeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  typeButtonText: {
    fontSize: 10,
    fontWeight: "700",
  },

  // =======================================
  // SECTION HEADER
  // =======================================

  sectionHeader: {
    height: 34,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth:
      StyleSheet.hairlineWidth,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
  },

  // =======================================
  // SCROLL
  // =======================================

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 80,
  },

  // =======================================
  // INPUT ROWS
  // =======================================

  detailRow: {
    minHeight: 48,
    paddingHorizontal: 0,
    flexDirection: "row",
    alignItems: "stretch",
    borderBottomWidth: 1,
  },

  rowLabelContainer: {
    width: 78,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.12)",
  },

  rowValueContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 12,
    minWidth: 0,
  },

  rowLabel: {
    fontSize: 12,
    fontWeight: "600",
  },

  rowValue: {
    fontSize: 12,
    fontWeight: "500",
  },

  valueWithIcon: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  categoryIcon: {
    width: 25,
    height: 25,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },

  // =======================================
  // AMOUNT
  // =======================================

  amountInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 12,
    minWidth: 0,
  },

  currencySymbol: {
    fontSize: 12,
    fontWeight: "500",
    marginRight: 6,
  },

  amountInput: {
    flex: 1,
    height: 46,
    padding: 0,
    fontSize: 13,
  },

  // =======================================
  // NOTE
  // =======================================

  noteRow: {
    minHeight: 63,
    paddingHorizontal: 0,
    flexDirection: "row",
    alignItems: "stretch",
    borderBottomWidth: 1,
  },

  noteInput: {
    flex: 1,
    height: 45,
    padding: 0,
    fontSize: 12,
    textAlignVertical: "center",
  },

  // =======================================
  // DONE
  // =======================================

  doneWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 48,
    marginBottom: 30,
  },

  doneButton: {
    minWidth: 105,
    height: 40,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  doneButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // =======================================
  // MODALS
  // =======================================

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  modalCard: {
    width: "100%",
    maxHeight: "70%",
    borderRadius: 14,
    overflow: "hidden",
  },

  modalTitle: {
    fontSize: 15,
    fontWeight: "700",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
  },

  modalList: {
    paddingHorizontal: 8,
  },

  modalItem: {
    minHeight: 52,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth:
      StyleSheet.hairlineWidth,
  },

  modalIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  modalItemText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
  },

  accountModalContent: {
    flex: 1,
    minWidth: 0,
  },

  currencyText: {
    fontSize: 10,
    marginTop: 2,
  },

  emptyText: {
    textAlign: "center",
    padding: 25,
    fontSize: 12,
  },
  rowChevronContainer: {
  width: 38,
  alignItems: "center",
  justifyContent: "center",
},
});