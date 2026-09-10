import TransactionDetail from "@/components/transaction/TransactionDetail";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Account = {
  account_id: number;
  id?: string;
  name: string;
  currency: string;
  color: string | null;
};

type Category = {
  category_id: number;
  id?: string;
  name: string;
  icon: string | null;
  color: string | null;
};

type Transaction = {
  transaction_id: number;
  account_id: number;
  category_id: number | null;
  transaction_type: "expense" | "income" | "transfer" | string;
  amount: number;
  transaction_date: string;
  description: string | null;
  notes: string | null;
  to_account_id: number | null;
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const FALLBACK_CATEGORY_COLORS = [
  "#F59E0B",
  "#3B82F6",
  "#8B5CF6",
  "#22C55E",
  "#EF4444",
];

export default function Home() {
  const { theme, mode } = useTheme();

  const [selectedMonth, setSelectedMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] =
    useState<Account | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [showAccounts, setShowAccounts] = useState(false);
  const [showTransactionDetail, setShowTransactionDetail] =
    useState(false);

  const [transactionType, setTransactionType] =
    useState<"expense" | "income">("expense");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ---------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------

  const getDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formatAmount = (amount: number) => {
    return `$${Math.abs(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getCategory = (categoryId: number | null) => {
    if (categoryId === null) {
      return null;
    }

    return (
      categories.find(
        (category) => category.category_id === categoryId
      ) || null
    );
  };

  const getCategoryColor = (
    category: Category | null,
    index = 0
  ) => {
    return (
      category?.color ||
      FALLBACK_CATEGORY_COLORS[
        index % FALLBACK_CATEGORY_COLORS.length
      ]
    );
  };

  const getTransactionTitle = (transaction: Transaction) => {
    const category = getCategory(transaction.category_id);

    if (category?.name) {
      return category.name;
    }

    if (transaction.description) {
      return transaction.description;
    }

    if (transaction.transaction_type === "income") {
      return "Income";
    }

    if (transaction.transaction_type === "transfer") {
      return "Transfer";
    }

    return "Expense";
  };

  const getTransactionIcon = (transaction: Transaction) => {
    const category = getCategory(transaction.category_id);

    if (category?.icon) {
      return category.icon;
    }

    if (transaction.transaction_type === "income") {
      return "cash-plus";
    }

    if (transaction.transaction_type === "transfer") {
      return "swap-horizontal";
    }

    return "cash-minus";
  };

  const getTransactionIconColor = (transaction: Transaction) => {
    const category = getCategory(transaction.category_id);

    if (category?.color) {
      return category.color;
    }

    if (transaction.transaction_type === "income") {
      return "#22C55E";
    }

    if (transaction.transaction_type === "transfer") {
      return "#F59E0B";
    }

    return "#EF4444";
  };

  // ---------------------------------------------------------
  // LOAD ACCOUNTS + CATEGORIES
  // ---------------------------------------------------------

  const loadAccountsAndCategories = useCallback(async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setAccounts([]);
        setSelectedAccount(null);
        setCategories([]);
        return;
      }

      const { data: accountData, error: accountError } =
        await supabase
          .from("accounts")
          .select("account_id, id, name, currency, color")
          .eq("user_id", user.id)
          .order("account_id", { ascending: true });

      if (accountError) {
        console.error("Error loading accounts:", accountError);
        setAccounts([]);
        setSelectedAccount(null);
      } else {
        const loadedAccounts = (accountData as Account[]) || [];

        setAccounts(loadedAccounts);

        setSelectedAccount((current) => {
          if (current) {
            const exists = loadedAccounts.some(
              (account) =>
                account.account_id === current.account_id
            );

            if (exists) {
              return current;
            }
          }

          return loadedAccounts.length > 0
            ? loadedAccounts[0]
            : null;
        });
      }

      const { data: categoryData, error: categoryError } =
        await supabase
          .from("categories")
          .select("category_id, id, name, icon, color")
          .or(`user_id.is.null,user_id.eq.${user.id}`)
          .order("name", { ascending: true });

      if (categoryError) {
        console.error("Error loading categories:", categoryError);
        setCategories([]);
      } else {
        setCategories((categoryData as Category[]) || []);
      }
    } catch (error) {
      console.error("loadAccountsAndCategories:", error);
    }
  }, []);

  // ---------------------------------------------------------
  // LOAD MONTH TRANSACTIONS
  // ---------------------------------------------------------

  const loadTransactions = useCallback(async () => {
    if (!selectedAccount) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();

      const startDate = new Date(year, month, 1);
      const nextMonthDate = new Date(year, month + 1, 1);

      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
            transaction_id,
            account_id,
            category_id,
            transaction_type,
            amount,
            transaction_date,
            description,
            notes,
            to_account_id
          `
        )
        .eq("account_id", selectedAccount.account_id)
        .gte("transaction_date", getDateString(startDate))
        .lt("transaction_date", getDateString(nextMonthDate))
        .order("transaction_date", { ascending: false })
        .order("transaction_id", { ascending: false });

      if (error) {
        console.error("Error loading transactions:", error);
        setTransactions([]);
      } else {
        setTransactions((data as Transaction[]) || []);
      }
    } catch (error) {
      console.error("loadTransactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedAccount, selectedMonth]);

  useEffect(() => {
    loadAccountsAndCategories();
  }, [loadAccountsAndCategories]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // ---------------------------------------------------------
  // REFRESH
  // ---------------------------------------------------------

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAccountsAndCategories();
    await loadTransactions();
  };

  // ---------------------------------------------------------
  // MONTH NAVIGATION
  // ---------------------------------------------------------

  const goToPreviousMonth = () => {
    setSelectedMonth(
      new Date(
        selectedMonth.getFullYear(),
        selectedMonth.getMonth() - 1,
        1
      )
    );
  };

  const goToNextMonth = () => {
    setSelectedMonth(
      new Date(
        selectedMonth.getFullYear(),
        selectedMonth.getMonth() + 1,
        1
      )
    );
  };

  // ---------------------------------------------------------
  // FINANCIAL TOTALS
  // ---------------------------------------------------------

  const incomeTotal = useMemo(() => {
    return transactions
      .filter(
        (transaction) =>
          transaction.transaction_type === "income"
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount || 0),
        0
      );
  }, [transactions]);

  const expenseTotal = useMemo(() => {
    return transactions
      .filter(
        (transaction) =>
          transaction.transaction_type === "expense"
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount || 0),
        0
      );
  }, [transactions]);

  const balance = incomeTotal - expenseTotal;

  // ---------------------------------------------------------
  // RECENT TRANSACTIONS
  // ---------------------------------------------------------

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 4);
  }, [transactions]);

  // ---------------------------------------------------------
  // OPEN ADD TRANSACTION
  // ---------------------------------------------------------

  const openAddTransaction = (
    type: "expense" | "income"
  ) => {
    if (!selectedAccount) {
      setShowAccounts(true);
      return;
    }

    setTransactionType(type);
    setShowTransactionDetail(true);
  };

  // ---------------------------------------------------------
  // TRANSACTION DETAIL
  // ---------------------------------------------------------

  if (showTransactionDetail && selectedAccount) {
    return (
      <View
        style={[
          styles.screen,
          { backgroundColor: theme.primarybg },
        ]}
      >
        <StatusBar
          barStyle={
            mode === "dark" ? "light-content" : "dark-content"
          }
          backgroundColor={theme.primarybg}
        />

        <TransactionDetail
          initialTransactionType={transactionType}
          onClose={() => setShowTransactionDetail(false)}
          onSaved={() => {
            setShowTransactionDetail(false);
            loadTransactions();
          }}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: theme.primarybg },
      ]}
    >
      <StatusBar
        barStyle={
          mode === "dark" ? "light-content" : "dark-content"
        }
        backgroundColor={theme.primarybg}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* =====================================================
            MONTH + ACCOUNT
        ===================================================== */}

        <View style={styles.selectorRow}>
          <View
            style={[
              styles.monthSelector,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <Pressable
              onPress={goToPreviousMonth}
              style={styles.monthArrow}
            >
              <Ionicons
                name="chevron-back"
                size={17}
                color={theme.text}
              />
            </Pressable>

            <Text
              style={[
                styles.monthText,
                { color: theme.text },
              ]}
              numberOfLines={1}
            >
              {MONTH_NAMES[selectedMonth.getMonth()]}{" "}
              {selectedMonth.getFullYear()}
            </Text>

            <Pressable
              onPress={goToNextMonth}
              style={styles.monthArrow}
            >
              <Ionicons
                name="chevron-forward"
                size={17}
                color={theme.text}
              />
            </Pressable>
          </View>

          <Pressable
            onPress={() => setShowAccounts(true)}
            style={[
              styles.accountSelector,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.accountSelectorLeft}>
              <View
                style={[
                  styles.accountIcon,
                  {
                    backgroundColor:
                      `${selectedAccount?.color || theme.primary}18`,
                  },
                ]}
              >
                <Ionicons
                  name="person"
                  size={14}
                  color={
                    selectedAccount?.color || theme.primary
                  }
                />
              </View>

              <Text
                style={[
                  styles.accountText,
                  { color: theme.text },
                ]}
                numberOfLines={1}
              >
                {selectedAccount?.name || "Select Account"}
              </Text>
            </View>

            <Ionicons
              name="chevron-down"
              size={16}
              color={theme.secondaryText}
            />
          </Pressable>
        </View>

        {/* =====================================================
            BALANCE HERO
        ===================================================== */}

        <View
          style={[
            styles.balanceHero,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.balanceHeroTop}>
            <View>
              <Text
                style={[
                  styles.balanceHeroLabel,
                  { color: theme.secondaryText },
                ]}
              >
                Total Balance
              </Text>

              <Text
                style={[
                  styles.balanceHeroAmount,
                  { color: theme.text },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {balance < 0 ? "-" : ""}
                {formatAmount(balance)}
              </Text>
            </View>

            <View
              style={[
                styles.balanceStatus,
                {
                  backgroundColor:
                    balance >= 0 ? "#ECFDF5" : "#FFF1F2",
                },
              ]}
            >
              <Ionicons
                name={
                  balance >= 0
                    ? "trending-up"
                    : "trending-down"
                }
                size={15}
                color={
                  balance >= 0 ? "#16A34A" : "#EF4444"
                }
              />

              <Text
                style={{
                  color:
                    balance >= 0 ? "#16A34A" : "#EF4444",
                  fontSize: 9,
                  fontWeight: "700",
                }}
              >
                {balance >= 0 ? "Positive" : "Negative"}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.balanceBottomLine,
              { backgroundColor: theme.border },
            ]}
          />

          <View style={styles.balanceStats}>
            <View>
              <Text
                style={[
                  styles.balanceStatLabel,
                  { color: theme.secondaryText },
                ]}
              >
                Income
              </Text>

              <Text
                style={[
                  styles.balanceStatAmount,
                  { color: "#16A34A" },
                ]}
              >
                {formatAmount(incomeTotal)}
              </Text>
            </View>

            <View style={styles.balanceStatDivider} />

            <View>
              <Text
                style={[
                  styles.balanceStatLabel,
                  { color: theme.secondaryText },
                ]}
              >
                Expenses
              </Text>

              <Text
                style={[
                  styles.balanceStatAmount,
                  { color: "#EF4444" },
                ]}
              >
                {formatAmount(expenseTotal)}
              </Text>
            </View>
          </View>
        </View>

        {/* =====================================================
            RECENT TRANSACTIONS
        ===================================================== */}

        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.text },
            ]}
          >
            Recent Transactions
          </Text>

          <Text
            style={[
              styles.viewAll,
              { color: theme.primary },
            ]}
          >
            View All
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator
              size="small"
              color={theme.primary}
            />
          </View>
        ) : recentTransactions.length === 0 ? (
          <View
            style={[
              styles.emptyTransactions,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <View
              style={[
                styles.emptyTransactionIcon,
                {
                  backgroundColor:
                    `${theme.primary}15`,
                },
              ]}
            >
              <Ionicons
                name="receipt-outline"
                size={23}
                color={theme.primary}
              />
            </View>

            <View style={styles.emptyTransactionText}>
              <Text
                style={[
                  styles.emptyTransactionTitle,
                  { color: theme.text },
                ]}
              >
                No transactions yet
              </Text>

              <Text
                style={[
                  styles.emptyTransactionSubtitle,
                  { color: theme.secondaryText },
                ]}
              >
                Add your first expense or income below.
              </Text>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.transactionCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            {recentTransactions.map(
              (transaction, index) => {
                const icon =
                  getTransactionIcon(transaction);
                const iconColor =
                  getTransactionIconColor(transaction);

                const isIncome =
                  transaction.transaction_type === "income";

                const isTransfer =
                  transaction.transaction_type === "transfer";

                return (
                  <View key={transaction.transaction_id}>
                    <Pressable
                      style={styles.transactionRow}
                    >
                      <View
                        style={[
                          styles.transactionIcon,
                          {
                            backgroundColor:
                              `${iconColor}18`,
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={icon as any}
                          size={18}
                          color={iconColor}
                        />
                      </View>

                      <View style={styles.transactionInfo}>
                        <Text
                          style={[
                            styles.transactionTitle,
                            { color: theme.text },
                          ]}
                          numberOfLines={1}
                        >
                          {getTransactionTitle(transaction)}
                        </Text>

                        <Text
                          style={[
                            styles.transactionDate,
                            { color: theme.secondaryText },
                          ]}
                        >
                          {formatDateLabel(
                            transaction.transaction_date
                          )}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.transactionAmount,
                          {
                            color: isIncome
                              ? "#16A34A"
                              : isTransfer
                              ? "#D97706"
                              : "#EF4444",
                          },
                        ]}
                      >
                        {isIncome ? "+" : ""}
                        {formatAmount(
                          Number(transaction.amount || 0)
                        )}
                      </Text>

                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={theme.secondaryText}
                      />
                    </Pressable>

                    {index < recentTransactions.length - 1 && (
                      <View
                        style={[
                          styles.transactionDivider,
                          {
                            backgroundColor: theme.border,
                          },
                        ]}
                      />
                    )}
                  </View>
                );
              }
            )}
          </View>
        )}

        {/* =====================================================
            BOTTOM ACTIONS
        ===================================================== */}

        <View
          style={[
            styles.bottomLine,
            { backgroundColor: theme.border },
          ]}
        />

        <View style={styles.actionRow}>
          <Pressable
            onPress={() => openAddTransaction("expense")}
            style={[
              styles.actionButton,
              {
                backgroundColor: "#FFF1F2",
                borderColor: "#FECDD3",
              },
            ]}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: "#FFE4E6" },
              ]}
            >
              <Ionicons
                name="arrow-up"
                size={18}
                color="#EF4444"
              />
            </View>

            <Text
              style={[
                styles.actionText,
                { color: "#DC2626" },
              ]}
            >
              Add Expense
            </Text>
          </Pressable>

          <Pressable
            onPress={() => openAddTransaction("income")}
            style={[
              styles.actionButton,
              {
                backgroundColor: "#ECFDF5",
                borderColor: "#BBF7D0",
              },
            ]}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: "#DCFCE7" },
              ]}
            >
              <Ionicons
                name="arrow-down"
                size={18}
                color="#16A34A"
              />
            </View>

            <Text
              style={[
                styles.actionText,
                { color: "#15803D" },
              ]}
            >
              Add Income
            </Text>
          </Pressable>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* =======================================================
          ACCOUNT SELECTION
      ======================================================= */}

      <Modal
        visible={showAccounts}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAccounts(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAccounts(false)}
        >
          <Pressable
            style={[
              styles.accountModal,
              { backgroundColor: theme.card },
            ]}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  { color: theme.text },
                ]}
              >
                Select Account
              </Text>

              <Pressable
                onPress={() => setShowAccounts(false)}
              >
                <Ionicons
                  name="close"
                  size={21}
                  color={theme.secondaryText}
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
            >
              {accounts.length === 0 ? (
                <View style={styles.noAccountBox}>
                  <Ionicons
                    name="wallet-outline"
                    size={28}
                    color={theme.secondaryText}
                  />

                  <Text
                    style={[
                      styles.noAccountText,
                      { color: theme.secondaryText },
                    ]}
                  >
                    No accounts found
                  </Text>
                </View>
              ) : (
                accounts.map((account) => {
                  const isSelected =
                    selectedAccount?.account_id ===
                    account.account_id;

                  return (
                    <Pressable
                      key={account.account_id}
                      onPress={() => {
                        setSelectedAccount(account);
                        setShowAccounts(false);
                      }}
                      style={[
                        styles.accountOption,
                        {
                          borderBottomColor: theme.border,
                        },
                        isSelected && {
                          backgroundColor:
                            `${theme.primary}08`,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.accountOptionIcon,
                          {
                            backgroundColor:
                              `${account.color || theme.primary}18`,
                          },
                        ]}
                      >
                        <Ionicons
                          name="person"
                          size={16}
                          color={
                            account.color || theme.primary
                          }
                        />
                      </View>

                      <View style={styles.accountOptionInfo}>
                        <Text
                          style={[
                            styles.accountOptionName,
                            { color: theme.text },
                          ]}
                        >
                          {account.name}
                        </Text>

                        <Text
                          style={[
                            styles.accountOptionCurrency,
                            { color: theme.secondaryText },
                          ]}
                        >
                          {account.currency}
                        </Text>
                      </View>

                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={21}
                          color={theme.primary}
                        />
                      )}
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function formatDateLabel(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 30,
  },

  // ---------------------------------------------------------
  // MONTH + ACCOUNT
  // ---------------------------------------------------------

  selectorRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },

  monthSelector: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  monthArrow: {
    width: 28,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  monthText: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "600",
  },

  accountSelector: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  accountSelectorLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },

  accountIcon: {
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },

  accountText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
  },

  // ---------------------------------------------------------
  // BALANCE HERO
  // ---------------------------------------------------------

  balanceHero: {
    minHeight: 122,
    borderWidth: 1,
    borderRadius: 15,
    padding: 12,
    marginBottom: 14,
  },

  balanceHeroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  balanceHeroLabel: {
    fontSize: 10,
    marginBottom: 4,
  },

  balanceHeroAmount: {
    fontSize: 25,
    fontWeight: "800",
  },

  balanceStatus: {
    height: 27,
    paddingHorizontal: 8,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  balanceBottomLine: {
    height: StyleSheet.hairlineWidth,
    marginTop: 10,
    marginBottom: 9,
  },

  balanceStats: {
    flexDirection: "row",
    alignItems: "center",
  },

  balanceStatLabel: {
    fontSize: 9,
    marginBottom: 3,
  },

  balanceStatAmount: {
    fontSize: 14,
    fontWeight: "700",
  },

  balanceStatDivider: {
    width: StyleSheet.hairlineWidth,
    height: 25,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 22,
  },

  // ---------------------------------------------------------
  // SECTION
  // ---------------------------------------------------------

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 7,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  viewAll: {
    fontSize: 10,
    fontWeight: "600",
  },

  // ---------------------------------------------------------
  // INCOME + EXPENSES
  // ---------------------------------------------------------


  // ---------------------------------------------------------
  // RECENT TRANSACTIONS
  // ---------------------------------------------------------

  transactionCard: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 2,
  },

  transactionRow: {
    minHeight: 52,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
  },

  transactionIcon: {
    width: 33,
    height: 33,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  transactionInfo: {
    flex: 1,
    minWidth: 0,
  },

  transactionTitle: {
    fontSize: 12,
    fontWeight: "600",
  },

  transactionDate: {
    fontSize: 9,
    marginTop: 3,
  },

  transactionAmount: {
    fontSize: 11,
    fontWeight: "700",
    marginHorizontal: 7,
  },

  transactionDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 54,
  },

  loadingBox: {
    height: 130,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTransactions: {
    minHeight: 86,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  emptyTransactionIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  emptyTransactionText: {
    flex: 1,
  },

  emptyTransactionTitle: {
    fontSize: 12,
    fontWeight: "700",
  },

  emptyTransactionSubtitle: {
    fontSize: 9,
    marginTop: 3,
  },

  // ---------------------------------------------------------
  // ACTION BUTTONS
  // ---------------------------------------------------------

  bottomLine: {
    height: StyleSheet.hairlineWidth,
    marginTop: 15,
    marginBottom: 12,
  },

  actionRow: {
    flexDirection: "row",
    gap: 9,
  },

  actionButton: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  actionIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },

  actionText: {
    fontSize: 11,
    fontWeight: "700",
  },

  bottomSpace: {
    height: 25,
  },

  // ---------------------------------------------------------
  // ACCOUNT MODAL
  // ---------------------------------------------------------

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  accountModal: {
    width: "100%",
    maxHeight: "65%",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: 18,
    overflow: "hidden",
  },

  modalHeader: {
    height: 55,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128,128,128,0.15)",
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  accountOption: {
    minHeight: 58,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  accountOptionIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  accountOptionInfo: {
    flex: 1,
  },

  accountOptionName: {
    fontSize: 13,
    fontWeight: "600",
  },

  accountOptionCurrency: {
    fontSize: 9,
    marginTop: 3,
  },

  noAccountBox: {
    minHeight: 150,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  noAccountText: {
    fontSize: 11,
  },
});
