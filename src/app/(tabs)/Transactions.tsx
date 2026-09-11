import TransactionDetail from "@/components/transaction/TransactionDetail";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Account = {
  account_id: number;
  id: string;
  name: string;
  currency: string;
  color: string | null;
};

type Category = {
  category_id: number;
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  type: string | null;
};

type Transaction = {
  transaction_id: number;
  account_id: number;
  category_id: number | null;
  transaction_type: "expense" | "income" | "transfer";
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

export default function Transactions() {
  const { theme } = useTheme();

  const { refresh } = useLocalSearchParams<{
    refresh?: string;
  }>();

  const [selectedMonth, setSelectedMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] =
    useState<Account | null>(null);

  const [showAccounts, setShowAccounts] = useState(false);

  const [transactionType, setTransactionType] = useState<
    "all" | "expense" | "income"
  >("all");

  const [showTypes, setShowTypes] = useState(false);

  // Show TransactionDetail directly inside this tab
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------
  // LOAD ACCOUNTS + CATEGORIES
  // ---------------------------------------------------------

  const loadData = useCallback(async () => {
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

      // -----------------------------------------------------
      // ACCOUNTS
      // Ordered by account_id
      // -----------------------------------------------------

      const { data: accountData, error: accountError } =
        await supabase
          .from("accounts")
          .select(
            "account_id, id, name, currency, color"
          )
          .eq("user_id", user.id)
          .order("account_id", {
            ascending: true,
          });

      if (accountError) {
        console.error(
          "Error loading accounts:",
          accountError
        );
        setAccounts([]);
        setSelectedAccount(null);
      } else {
        const loadedAccounts =
          (accountData as Account[]) || [];

        setAccounts(loadedAccounts);

        // Default account = first account by account_id
        if (loadedAccounts.length > 0) {
          setSelectedAccount((current) => {
            if (
              current &&
              loadedAccounts.some(
                (account) =>
                  account.account_id ===
                  current.account_id
              )
            ) {
              return current;
            }

            return loadedAccounts[0];
          });
        } else {
          setSelectedAccount(null);
        }
      }

      // -----------------------------------------------------
      // CATEGORIES
      // -----------------------------------------------------

      const { data: categoryData, error: categoryError } =
        await supabase
          .from("categories")
          .select(
            "category_id, id, name, icon, color, type"
          )
          .or(
            `user_id.is.null,user_id.eq.${user.id}`
          )
          .order("name", {
            ascending: true,
          });

      if (categoryError) {
        console.error(
          "Error loading categories:",
          categoryError
        );
        setCategories([]);
      } else {
        setCategories(
          (categoryData as Category[]) || []
        );
      }
    } catch (error) {
      console.error("loadData error:", error);
    }
  }, []);

  // ---------------------------------------------------------
  // LOAD TRANSACTIONS
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

      const startDate = new Date(
        year,
        month,
        1
      );

      const nextMonthDate = new Date(
        year,
        month + 1,
        1
      );

      const formatDate = (date: Date) => {
        const y = date.getFullYear();
        const m = String(
          date.getMonth() + 1
        ).padStart(2, "0");
        const d = String(
          date.getDate()
        ).padStart(2, "0");

        return `${y}-${m}-${d}`;
      };

      const startDateString =
        formatDate(startDate);

      const nextMonthString =
        formatDate(nextMonthDate);

      const {
        data,
        error,
      } = await supabase
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
        .eq(
          "account_id",
          selectedAccount.account_id
        )
        .gte(
          "transaction_date",
          startDateString
        )
        .lt(
          "transaction_date",
          nextMonthString
        )
        .order("transaction_date", {
          ascending: false,
        })
        .order("transaction_id", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Error loading transactions:",
          error
        );
        setTransactions([]);
      } else {
        setTransactions(
          (data as Transaction[]) || []
        );
      }
    } catch (error) {
      console.error(
        "loadTransactions error:",
        error
      );
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [selectedAccount, selectedMonth]);

  // ---------------------------------------------------------
  // INITIAL DATA
  // ---------------------------------------------------------

  useEffect(() => {
    loadData();
  }, [loadData, refresh]);

  // ---------------------------------------------------------
  // TRANSACTIONS
  // ---------------------------------------------------------

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions, refresh]);

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
  // TOTALS
  //
  // IMPORTANT:
  // Totals are calculated from ALL transactions,
  // not from the selected type filter.
  // ---------------------------------------------------------

  const incomeTotal = useMemo(() => {
    return transactions
      .filter(
        (transaction) =>
          transaction.transaction_type ===
          "income"
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
          transaction.transaction_type ===
          "expense"
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount || 0),
        0
      );
  }, [transactions]);

  // ---------------------------------------------------------
  // FILTER BY TYPE
  // ---------------------------------------------------------

  const filteredTransactions = useMemo(() => {
    if (transactionType === "all") {
      return transactions;
    }

    return transactions.filter(
      (transaction) =>
        transaction.transaction_type ===
        transactionType
    );
  }, [transactions, transactionType]);

  // ---------------------------------------------------------
  // CURRENCY
  // ---------------------------------------------------------

  const currencySymbol = useMemo(() => {
    const currency =
      selectedAccount?.currency || "INR";

    switch (currency.toUpperCase()) {
      case "INR":
        return "₹";
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      case "JPY":
        return "¥";
      default:
        return currency;
    }
  }, [selectedAccount]);

  const formatAmount = (amount: number) => {
    return `$${Math.abs(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // ---------------------------------------------------------
  // CATEGORY
  // ---------------------------------------------------------

  const getCategory = (
    categoryId: number | null
  ) => {
    if (!categoryId) {
      return null;
    }

    return (
      categories.find(
        (category) =>
          category.category_id === categoryId
      ) || null
    );
  };

  // ---------------------------------------------------------
  // DATE
  // ---------------------------------------------------------

  const formatTransactionDate = (
    dateString: string
  ) => {
    const date = new Date(
      `${dateString}T00:00:00`
    );

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ---------------------------------------------------------
  // TRANSACTION TITLE
  // ---------------------------------------------------------

  const getTransactionTitle = (
    transaction: Transaction
  ) => {
    const category = getCategory(
      transaction.category_id
    );

    if (category?.name) {
      return category.name;
    }

    if (transaction.description) {
      return transaction.description;
    }

    if (
      transaction.transaction_type ===
      "transfer"
    ) {
      return "Transfer";
    }

    if (
      transaction.transaction_type ===
      "income"
    ) {
      return "Income";
    }

    return "Expense";
  };

  // ---------------------------------------------------------
  // ICON
  // ---------------------------------------------------------

  const getTransactionIcon = (
    transaction: Transaction
  ) => {
    const category = getCategory(
      transaction.category_id
    );

    if (category?.icon) {
      return category.icon;
    }

    if (
      transaction.transaction_type ===
      "income"
    ) {
      return "cash-plus";
    }

    if (
      transaction.transaction_type ===
      "transfer"
    ) {
      return "swap-horizontal";
    }

    return "cash-minus";
  };

  // ---------------------------------------------------------
  // ICON COLOR
  // ---------------------------------------------------------

  const getTransactionIconColor = (
    transaction: Transaction
  ) => {
    const category = getCategory(
      transaction.category_id
    );

    if (category?.color) {
      return category.color;
    }

    if (
      transaction.transaction_type ===
      "income"
    ) {
      return "#22C55E";
    }

    if (
      transaction.transaction_type ===
      "transfer"
    ) {
      return "#3B82F6";
    }

    return "#EF4444";
  };

  // ---------------------------------------------------------
  // AMOUNT
  // ---------------------------------------------------------

  const getTransactionAmount = (
    transaction: Transaction
  ) => {
    const amount = formatAmount(
      Number(transaction.amount)
    );

    if (
      transaction.transaction_type ===
      "income"
    ) {
      return `+ ${amount}`;
    }

    if (
      transaction.transaction_type ===
      "expense"
    ) {
      return amount;
    }

    return amount;
  };

  // ---------------------------------------------------------
  // GROUP TRANSACTIONS BY DATE
  // ---------------------------------------------------------

  const groupedTransactions = useMemo(() => {
    const groups: {
      date: string;
      transactions: Transaction[];
    }[] = [];

    filteredTransactions.forEach(
      (transaction) => {
        const existingGroup =
          groups.find(
            (group) =>
              group.date ===
              transaction.transaction_date
          );

        if (existingGroup) {
          existingGroup.transactions.push(
            transaction
          );
        } else {
          groups.push({
            date: transaction.transaction_date,
            transactions: [transaction],
          });
        }
      }
    );

    return groups;
  }, [filteredTransactions]);

  // ---------------------------------------------------------
  // TYPE LABEL
  // ---------------------------------------------------------

  const transactionTypeLabel =
    transactionType === "all"
      ? "All Types"
      : transactionType === "expense"
      ? "Expense"
      : "Income";

  // ---------------------------------------------------------
  // OPEN ADD TRANSACTION
  // ---------------------------------------------------------

  const openAddTransaction = () => {
    setShowAccounts(false);
    setShowTypes(false);
    setShowTransactionDetail(true);
  };

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  // ---------------------------------------------------------
  // TRANSACTION DETAIL / ADD TRANSACTION
  // ---------------------------------------------------------

  if (showTransactionDetail) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
          },
        ]}
      >
        <TransactionDetail
          account_id={selectedAccount?.account_id ?? 0}
          account_name={selectedAccount?.name ?? ""}
          currency={selectedAccount?.currency ?? "INR"}
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
        styles.container,
        {
          backgroundColor:
            theme.background,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>
          <View style={styles.headerTextBox}>
            <Text
              style={[
                styles.headerTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Transactions
            </Text>

            <Text
              style={[
                styles.headerSubtitle,
                {
                  color:
                    theme.secondaryText,
                },
              ]}
            >
              Track your income and expenses
            </Text>
          </View>


        </View>

        {/* =================================================
            MONTH + ACCOUNT SELECTORS
        ================================================= */}

        <View style={styles.selectorRow}>
          {/* MONTH */}

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
              hitSlop={5}
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
                {
                  color: theme.text,
                },
              ]}
              numberOfLines={1}
            >
              {MONTH_NAMES[
                selectedMonth.getMonth()
              ]}{" "}
              {selectedMonth.getFullYear()}
            </Text>

            <Pressable
              onPress={goToNextMonth}
              style={styles.monthArrow}
              hitSlop={5}
            >
              <Ionicons
                name="chevron-forward"
                size={17}
                color={theme.text}
              />
            </Pressable>
          </View>

          {/* ACCOUNT */}

          <View style={styles.accountSection}>
            <Pressable
              onPress={() => {
                setShowTypes(false);
                setShowAccounts(!showAccounts);
              }}
              style={[
                styles.accountButton,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.accountButtonLeft}>
                <View
                  style={[
                    styles.accountUserIcon,
                    {
                      backgroundColor:
                        `${selectedAccount?.color || "#6366F1"}18`,
                    },
                  ]}
                >
                  <Ionicons
                    name="person"
                    size={14}
                    color={
                      selectedAccount?.color ||
                      "#6366F1"
                    }
                  />
                </View>

                <Text
                  style={[
                    styles.accountButtonText,
                    {
                      color: theme.text,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {selectedAccount?.name ||
                    "Select Account"}
                </Text>
              </View>

              <Ionicons
                name={
                  showAccounts
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={16}
                color={theme.secondaryText}
              />
            </Pressable>

            {showAccounts && (
              <View
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}
              >
                {accounts.length === 0 ? (
                  <Text
                    style={[
                      styles.emptyDropdownText,
                      {
                        color: theme.secondaryText,
                      },
                    ]}
                  >
                    No accounts found
                  </Text>
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
                          isSelected && {
                            backgroundColor:
                              theme.background,
                          },
                        ]}
                      >
                        <View style={styles.accountOptionLeft}>
                          <View
                            style={[
                              styles.accountUserIcon,
                              {
                                backgroundColor:
                                  `${account.color || "#6366F1"}18`,
                              },
                            ]}
                          >
                            <Ionicons
                              name="person"
                              size={14}
                              color={
                                account.color ||
                                "#6366F1"
                              }
                            />
                          </View>

                          <View>
                            <Text
                              style={[
                                styles.accountOptionText,
                                {
                                  color: theme.text,
                                },
                              ]}
                            >
                              {account.name}
                            </Text>

                            <Text
                              style={[
                                styles.accountIdText,
                                {
                                  color:
                                    theme.secondaryText,
                                },
                              ]}
                            >
                              {account.currency}
                            </Text>
                          </View>
                        </View>

                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={19}
                            color={
                              theme.primary ||
                              "#6366F1"
                            }
                          />
                        )}
                      </Pressable>
                    );
                  })
                )}
              </View>
            )}
          </View>
        </View>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <View style={styles.summaryRow}>
          {/* INCOME */}

          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor:
                  theme.card,
                borderColor:
                  theme.border,
              },
            ]}
          >
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor:
                    "rgba(34,197,94,0.12)",
                },
              ]}
            >
              <Ionicons
                name="arrow-down"
                size={19}
                color="#22C55E"
              />
            </View>

            <Text
              style={[
                styles.summaryAmount,
                {
                  color: "#22C55E",
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatAmount(incomeTotal)}
            </Text>
          </View>

          {/* EXPENSE */}

          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor:
                  theme.card,
                borderColor:
                  theme.border,
              },
            ]}
          >
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor:
                    "rgba(239,68,68,0.12)",
                },
              ]}
            >
              <Ionicons
                name="arrow-up"
                size={19}
                color="#EF4444"
              />
            </View>

            <Text
              style={[
                styles.summaryAmount,
                {
                  color: "#EF4444",
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatAmount(expenseTotal)}
            </Text>
          </View>
        </View>

        {/* =================================================
            TRANSACTIONS HEADER
        ================================================= */}

        <View
          style={styles.transactionsHeader}
        >
          <Text
            style={[
              styles.transactionsTitle,
              {
                color: theme.text,
              },
            ]}
          >
            Transactions
          </Text>

          <View
            style={styles.headerActions}
          >
            {/* TYPE FILTER */}

            <Pressable
              onPress={() => {
                setShowAccounts(false);
                setShowTypes(
                  !showTypes
                );
              }}
              style={[
                styles.typeButton,
                {
                  backgroundColor:
                    theme.card,
                  borderColor:
                    theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  {
                    color: theme.text,
                  },
                ]}
              >
                {transactionTypeLabel}
              </Text>

              <Ionicons
                name={
                  showTypes
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={17}
                color={
                  theme.secondaryText
                }
              />
            </Pressable>

            {/* FILTER BUTTON */}

            <Pressable
              style={[
                styles.filterButton,
                {
                  backgroundColor:
                    theme.card,
                  borderColor:
                    theme.border,
                },
              ]}
            >
              <Ionicons
                name="options-outline"
                size={19}
                color={theme.text}
              />
            </Pressable>


          </View>
        </View>

        {/* =================================================
            TYPE DROPDOWN
        ================================================= */}

        {showTypes && (
          <View
            style={[
              styles.typeDropdown,
              {
                backgroundColor:
                  theme.card,
                borderColor:
                  theme.border,
              },
            ]}
          >
            {(
              [
                {
                  value: "all",
                  label: "All Types",
                },
                {
                  value: "expense",
                  label: "Expense",
                },
                {
                  value: "income",
                  label: "Income",
                },
              ] as const
            ).map((option) => {
              const isSelected =
                transactionType ===
                option.value;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    setTransactionType(
                      option.value
                    );
                    setShowTypes(false);
                  }}
                  style={[
                    styles.typeOption,
                    isSelected && {
                      backgroundColor:
                        theme.background,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      {
                        color:
                          theme.text,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>

                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={
                        theme.primary ||
                        "#6366F1"
                      }
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        {/* =================================================
            CONTENT
        ================================================= */}

        {!selectedAccount ? (
          <View
            style={[
              styles.emptyState,
              {
                borderColor:
                  theme.border,
                backgroundColor:
                  theme.card,
              },
            ]}
          >
            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor:
                    theme.background,
                },
              ]}
            >
              <Ionicons
                name="wallet-outline"
                size={28}
                color={
                  theme.secondaryText
                }
              />
            </View>

            <Text
              style={[
                styles.emptyTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              No account selected
            </Text>

            <Text
              style={[
                styles.emptySubtitle,
                {
                  color:
                    theme.secondaryText,
                },
              ]}
            >
              Please select an account
              to view transactions.
            </Text>
          </View>
        ) : loading ? (
          <View
            style={styles.loadingContainer}
          >
            <ActivityIndicator
              size="small"
              color={
                theme.primary ||
                "#6366F1"
              }
            />

            <Text
              style={[
                styles.loadingText,
                {
                  color:
                    theme.secondaryText,
                },
              ]}
            >
              Loading transactions...
            </Text>
          </View>
        ) : transactions.length === 0 ? (
          <View
            style={[
              styles.emptyState,
              {
                borderColor:
                  theme.border,
                backgroundColor:
                  theme.card,
              },
            ]}
          >
            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor:
                    theme.background,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="receipt-outline"
                size={28}
                color={
                  theme.secondaryText
                }
              />
            </View>

            <Text
              style={[
                styles.emptyTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              No transactions
            </Text>

            <Text
              style={[
                styles.emptySubtitle,
                {
                  color:
                    theme.secondaryText,
                },
              ]}
            >
              No transactions found for{" "}
              {MONTH_NAMES[
                selectedMonth.getMonth()
              ]}{" "}
              {selectedMonth.getFullYear()}.
            </Text>


          </View>
        ) : filteredTransactions.length ===
          0 ? (
          <View
            style={[
              styles.emptyState,
              {
                borderColor:
                  theme.border,
                backgroundColor:
                  theme.card,
              },
            ]}
          >
            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor:
                    theme.background,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="filter-off-outline"
                size={28}
                color={
                  theme.secondaryText
                }
              />
            </View>

            <Text
              style={[
                styles.emptyTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              No {transactionTypeLabel.toLowerCase()}s
            </Text>

            <Text
              style={[
                styles.emptySubtitle,
                {
                  color:
                    theme.secondaryText,
                },
              ]}
            >
              There are no{" "}
              {transactionTypeLabel.toLowerCase()}{" "}
              transactions for this month.
            </Text>
          </View>
        ) : (
          <View style={styles.transactionList}>
            {groupedTransactions.map(
              (group) => (
                <View
                  key={group.date}
                  style={
                    styles.transactionGroup
                  }
                >
                  {/* DATE */}

                  <Text
                    style={[
                      styles.groupDate,
                      {
                        color:
                          theme.secondaryText,
                      },
                    ]}
                  >
                    {formatTransactionDate(
                      group.date
                    )}
                  </Text>

                  {/* TRANSACTIONS */}

                  <View
                    style={[
                      styles.transactionCard,
                      {
                        backgroundColor:
                          theme.card,
                        borderColor:
                          theme.border,
                      },
                    ]}
                  >
                    {group.transactions.map(
                      (
                        transaction,
                        index
                      ) => {
                        const icon =
                          getTransactionIcon(
                            transaction
                          );

                        const iconColor =
                          getTransactionIconColor(
                            transaction
                          );

                        return (
                          <View
                            key={
                              transaction.transaction_id
                            }
                          >
                            <Pressable
                              onPress={() => {
                                // Transaction viewing/editing will be connected
                                // to TransactionDetail in the next step.
                              }}
                              style={
                                styles.transactionRow
                              }
                            >
                              {/* ICON */}

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
                                  name={
                                    icon as any
                                  }
                                  size={
                                    21
                                  }
                                  color={
                                    iconColor
                                  }
                                />
                              </View>

                              {/* DETAILS */}

                              <View
                                style={
                                  styles.transactionDetails
                                }
                              >
                                <Text
                                  numberOfLines={
                                    1
                                  }
                                  style={[
                                    styles.transactionTitle,
                                    {
                                      color:
                                        theme.text,
                                    },
                                  ]}
                                >
                                  {getTransactionTitle(
                                    transaction
                                  )}
                                </Text>

                                <Text
                                  numberOfLines={
                                    1
                                  }
                                  style={[
                                    styles.transactionSubtitle,
                                    {
                                      color:
                                        theme.secondaryText,
                                    },
                                  ]}
                                >
                                  {selectedAccount.name}
                                </Text>
                              </View>

                              {/* AMOUNT */}

                              <View
                                style={
                                  styles.transactionAmountBox
                                }
                              >
                                <Text
                                  style={[
                                    styles.transactionAmount,
                                    {
                                      color:
                                        transaction.transaction_type ===
                                        "income"
                                          ? "#22C55E"
                                          : transaction.transaction_type ===
                                            "expense"
                                          ? "#EF4444"
                                          : theme.text,
                                    },
                                  ]}
                                >
                                  {getTransactionAmount(
                                    transaction
                                  )}
                                </Text>
                              </View>
                            </Pressable>

                            {index <
                              group
                                .transactions
                                .length -
                                1 && (
                              <View
                                style={[
                                  styles.divider,
                                  {
                                    backgroundColor:
                                      theme.border,
                                  },
                                ]}
                              />
                            )}
                          </View>
                        );
                      }
                    )}
                  </View>
                </View>
              )
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// =============================================================
// STYLES
// =============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 30,
  },

  // -----------------------------------------------------------
  // HEADER
  // -----------------------------------------------------------

  header: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  headerTextBox: {
    flex: 1,
  },


  headerTitle: {
    fontSize: 21,
    fontWeight: "700",
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 10,
  },

  // -----------------------------------------------------------
  // MONTH
  // -----------------------------------------------------------

  selectorRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 9,
    position: "relative",
    zIndex: 20,
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

  // -----------------------------------------------------------
  // ACCOUNT
  // -----------------------------------------------------------

  accountSection: {
    flex: 1,
    position: "relative",
    zIndex: 30,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 7,
  },

  accountButton: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  accountButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },

  accountUserIcon: {
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },

  accountButtonText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
  },

  dropdown: {
    position: "absolute",
    top: 45,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 11,
    overflow: "hidden",
    zIndex: 50,
    elevation: 8,
  },

  accountOption: {
    minHeight: 50,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  accountOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  accountOptionText: {
    fontSize: 12,
    fontWeight: "600",
  },

  accountIdText: {
    fontSize: 9,
    marginTop: 2,
  },

  emptyDropdownText: {
    padding: 16,
    fontSize: 13,
  },

  // -----------------------------------------------------------
  // SUMMARY
  // -----------------------------------------------------------

  summaryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },

  summaryCard: {
    flex: 1,
    height: 55,
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  summaryIcon: {
    width: 33,
    height: 33,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  summaryAmount: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
  },

  // -----------------------------------------------------------
  // TRANSACTIONS HEADER
  // -----------------------------------------------------------

  transactionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  transactionsTitle: {
    fontSize: 17,
    fontWeight: "700",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  // -----------------------------------------------------------
  // TYPE BUTTON
  // -----------------------------------------------------------

  typeButton: {
    minHeight: 31,
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  typeButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // -----------------------------------------------------------
  // TYPE DROPDOWN
  // -----------------------------------------------------------

  typeDropdown: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 14,
    zIndex: 10,
    elevation: 5,
  },

  typeOption: {
    minHeight: 48,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  typeOptionText: {
    fontSize: 14,
    fontWeight: "500",
  },

  // -----------------------------------------------------------
  // FILTER
  // -----------------------------------------------------------

  filterButton: {
    width: 34,
    height: 31,
    borderWidth: 1,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  // -----------------------------------------------------------
  // ADD
  // -----------------------------------------------------------

  addTransactionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  // -----------------------------------------------------------
  // LOADING
  // -----------------------------------------------------------

  loadingContainer: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 13,
  },

  // -----------------------------------------------------------
  // EMPTY STATE
  // -----------------------------------------------------------

  emptyState: {
    minHeight: 230,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingVertical: 25,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },

  emptySubtitle: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 290,
  },

  emptyAddButton: {
    height: 42,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  emptyAddButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  // -----------------------------------------------------------
  // TRANSACTION LIST
  // -----------------------------------------------------------

  transactionList: {
    marginTop: 2,
  },

  transactionGroup: {
    marginBottom: 10,
  },

  groupDate: {
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 5,
    marginLeft: 3,
  },

  transactionCard: {
    borderWidth: 1,
    borderRadius: 11,
    overflow: "hidden",
  },

  transactionRow: {
    minHeight: 57,
    paddingHorizontal: 9,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
  },

  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  transactionDetails: {
    flex: 1,
    minWidth: 0,
  },

  transactionTitle: {
    fontSize: 12,
    fontWeight: "600",
  },

  transactionSubtitle: {
    fontSize: 9,
    marginTop: 3,
  },

  transactionAmountBox: {
    marginLeft: 10,
    alignItems: "flex-end",
  },

  transactionAmount: {
    fontSize: 11,
    fontWeight: "700",
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 54,
  },
});