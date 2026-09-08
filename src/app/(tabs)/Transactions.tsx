import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { useLocalSearchParams } from "expo-router";

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

  const { refresh } =
    useLocalSearchParams<{ refresh?: string }>();

  // =========================================
  // MONTH
  // =========================================

  const [selectedMonth, setSelectedMonth] =
    useState(new Date(2026, 8, 1));

  // =========================================
  // ACCOUNTS
  // =========================================

  const [accounts, setAccounts] =
    useState<Account[]>([]);

  const [selectedAccount, setSelectedAccount] =
    useState<Account | null>(null);

  const [showAccounts, setShowAccounts] =
    useState(false);

  // =========================================
  // TRANSACTIONS
  // =========================================

  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] = useState(true);

  // =========================================
  // LOAD DATA
  // =========================================

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // ---------------------------------------
      // CURRENT USER
      // ---------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        throw new Error("User is not logged in.");
      }

      // ---------------------------------------
      // ACCOUNTS
      // ---------------------------------------

      const { data: accountData, error: accountError } =
        await supabase
          .from("accounts")
          .select(`
            account_id,
            id,
            name,
            currency,
            color
          `)
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: true,
          });

      if (accountError) throw accountError;

      const loadedAccounts =
        (accountData ?? []) as Account[];

      setAccounts(loadedAccounts);

      // ---------------------------------------
      // DEFAULT ACCOUNT
      // ---------------------------------------

      if (loadedAccounts.length > 0) {
        setSelectedAccount((current) => {
          if (current) {
            const stillExists =
              loadedAccounts.find(
                (account) =>
                  account.account_id ===
                  current.account_id
              );

            if (stillExists) {
              return stillExists;
            }
          }

          const personalAccount =
            loadedAccounts.find(
              (account) =>
                account.name.toLowerCase() ===
                "personal"
            );

          return (
            personalAccount ??
            loadedAccounts[0]
          );
        });
      } else {
        setSelectedAccount(null);
      }

      // ---------------------------------------
      // CATEGORIES
      // ---------------------------------------

      const {
        data: categoryData,
        error: categoryError,
      } = await supabase
        .from("categories")
        .select(`
          category_id,
          id,
          name,
          icon,
          color,
          type
        `)
        .or(
          `user_id.is.null,user_id.eq.${user.id}`
        )
        .order("name", {
          ascending: true,
        });

      if (categoryError) throw categoryError;

      setCategories(
        (categoryData ?? []) as Category[]
      );
    } catch (error) {
      console.error(
        "Failed to load transaction data:",
        error
      );
    }
  }, []);

  // =========================================
  // LOAD TRANSACTIONS
  // =========================================

  const loadTransactions = useCallback(
    async () => {
      if (!selectedAccount) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const year =
          selectedMonth.getFullYear();

        const month =
          selectedMonth.getMonth();

        const firstDay = new Date(
          year,
          month,
          1
        );

        const nextMonth = new Date(
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

        const startDate =
          formatDate(firstDay);

        const endDate =
          formatDate(nextMonth);

        const {
          data,
          error,
        } = await supabase
          .from("transactions")
          .select(`
            transaction_id,
            account_id,
            category_id,
            transaction_type,
            amount,
            transaction_date,
            description,
            notes,
            to_account_id
          `)
          .eq(
            "account_id",
            selectedAccount.account_id
          )
          .gte(
            "transaction_date",
            startDate
          )
          .lt(
            "transaction_date",
            endDate
          )
          .order("transaction_date", {
            ascending: false,
          })
          .order("transaction_id", {
            ascending: false,
          });

        if (error) throw error;

        setTransactions(
          (data ?? []) as Transaction[]
        );
      } catch (error) {
        console.error(
          "Failed to load transactions:",
          error
        );

        setTransactions([]);
      } finally {
        setLoading(false);
      }
    },
    [selectedAccount, selectedMonth]
  );

  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {
    loadData();
  }, [loadData, refresh]);

  // =========================================
  // LOAD TRANSACTIONS AFTER ACCOUNT/DATA LOAD
  // =========================================

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions, refresh]);

  // =========================================
  // MONTH TEXT
  // =========================================

  const monthText = `${MONTH_NAMES[
    selectedMonth.getMonth()
  ]} ${selectedMonth.getFullYear()}`;

  // =========================================
  // MONTH NAVIGATION
  // =========================================

  const goPreviousMonth = () => {
    setSelectedMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() - 1,
          1
        )
    );
  };

  const goNextMonth = () => {
    setSelectedMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + 1,
          1
        )
    );
  };

  // =========================================
  // SUMMARY
  // =========================================

  const incomeTotal = useMemo(() => {
    return transactions
      .filter(
        (item) =>
          item.transaction_type === "income"
      )
      .reduce(
        (total, item) =>
          total + Number(item.amount),
        0
      );
  }, [transactions]);

  const expenseTotal = useMemo(() => {
    return transactions
      .filter(
        (item) =>
          item.transaction_type === "expense"
      )
      .reduce(
        (total, item) =>
          total + Number(item.amount),
        0
      );
  }, [transactions]);

  // =========================================
  // CURRENCY
  // =========================================

  const getCurrencySymbol = (
    currency: string
  ) => {
    if (currency?.startsWith("USD"))
      return "$";

    if (currency?.startsWith("EUR"))
      return "€";

    if (currency?.startsWith("GBP"))
      return "£";

    if (currency?.startsWith("JPY"))
      return "¥";

    return "₹";
  };

  const currencySymbol =
    getCurrencySymbol(
      selectedAccount?.currency ?? ""
    );

  const formatAmount = (
    amount: number
  ) => {
    return `${currencySymbol}${Number(
      amount
    ).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // =========================================
  // CATEGORY
  // =========================================

  const getCategory = (
    categoryId: number | null
  ) => {
    if (!categoryId) return null;

    return categories.find(
      (category) =>
        category.category_id === categoryId
    );
  };

  // =========================================
  // DATE
  // =========================================

  const formatTransactionDate = (
    dateString: string
  ) => {
    const date = new Date(
      `${dateString}T00:00:00`
    );

    return date.toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================
  // GROUP TRANSACTIONS BY DATE
  // =========================================

  const groupedTransactions =
    useMemo(() => {
      const groups: {
        date: string;
        items: Transaction[];
      }[] = [];

      transactions.forEach((transaction) => {
        const existing = groups.find(
          (group) =>
            group.date ===
            transaction.transaction_date
        );

        if (existing) {
          existing.items.push(transaction);
        } else {
          groups.push({
            date:
              transaction.transaction_date,
            items: [transaction],
          });
        }
      });

      return groups;
    }, [transactions]);

  // =========================================
  // TRANSACTION ICON
  // =========================================

  const getTransactionIcon = (
    transaction: Transaction
  ) => {
    if (
      transaction.transaction_type ===
      "transfer"
    ) {
      return "swap-horizontal";
    }

    const category = getCategory(
      transaction.category_id
    );

    return category?.icon || "receipt-outline";
  };

  // =========================================
  // TRANSACTION COLOR
  // =========================================

  const getTransactionColor = (
    transaction: Transaction
  ) => {
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
      return "#FACC15";
    }

    const category = getCategory(
      transaction.category_id
    );

    return (
      category?.color ||
      theme.primary
    );
  };

  // =========================================
  // TRANSACTION TITLE
  // =========================================

  const getTransactionTitle = (
    transaction: Transaction
  ) => {
    if (
      transaction.transaction_type ===
      "transfer"
    ) {
      return "Transfer";
    }

    const category = getCategory(
      transaction.category_id
    );

    return (
      category?.name ||
      transaction.description ||
      "Transaction"
    );
  };

  // =========================================
  // TRANSACTION AMOUNT
  // =========================================

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
      return `- ${amount}`;
    }

    return amount;
  };

  // =========================================
  // SCREEN
  // =========================================

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.primarybg,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* =================================
            MONTH + ACCOUNT
        ================================= */}

        <View style={styles.selectorRow}>
          {/* MONTH */}

          <Pressable
            style={[
              styles.selector,
              {
                backgroundColor:
                  theme.card,
                borderColor:
                  theme.border,
              },
            ]}
            onPress={() => {
              // Month dropdown can be added next.
            }}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={theme.primary}
            />

            <Text
              numberOfLines={1}
              style={[
                styles.selectorText,
                {
                  color: theme.text,
                },
              ]}
            >
              {monthText}
            </Text>

            <Ionicons
              name="chevron-down"
              size={18}
              color={theme.secondaryText}
            />
          </Pressable>

          {/* ACCOUNT */}

          <Pressable
            style={[
              styles.selector,
              {
                backgroundColor:
                  theme.card,
                borderColor:
                  theme.border,
              },
            ]}
            onPress={() =>
              setShowAccounts(
                !showAccounts
              )
            }
          >
            <Ionicons
              name="wallet-outline"
              size={20}
              color={theme.primary}
            />

            <Text
              numberOfLines={1}
              style={[
                styles.selectorText,
                {
                  color: theme.text,
                },
              ]}
            >
              {selectedAccount?.name ??
                "Personal"}
            </Text>

            <Ionicons
              name={
                showAccounts
                  ? "chevron-up"
                  : "chevron-down"
              }
              size={18}
              color={theme.secondaryText}
            />
          </Pressable>
        </View>

        {/* =================================
            ACCOUNT DROPDOWN
        ================================= */}

        {showAccounts &&
          accounts.length > 0 && (
            <View
              style={[
                styles.accountDropdown,
                {
                  backgroundColor:
                    theme.card,
                  borderColor:
                    theme.border,
                },
              ]}
            >
              {accounts.map((account) => {
                const selected =
                  selectedAccount?.account_id ===
                  account.account_id;

                return (
                  <Pressable
                    key={account.account_id}
                    style={[
                      styles.accountOption,
                      {
                        borderBottomColor:
                          theme.border,
                      },
                    ]}
                    onPress={() => {
                      setSelectedAccount(
                        account
                      );
                      setShowAccounts(false);
                    }}
                  >
                    <View
                      style={[
                        styles.accountOptionIcon,
                        {
                          backgroundColor:
                            account.color
                              ? account.color +
                                "22"
                              : theme.primarybg,
                        },
                      ]}
                    >
                      <Ionicons
                        name="wallet-outline"
                        size={18}
                        color={
                          account.color ||
                          theme.primary
                        }
                      />
                    </View>

                    <Text
                      style={[
                        styles.accountOptionText,
                        {
                          color: selected
                            ? theme.primary
                            : theme.text,
                        },
                      ]}
                    >
                      {account.name}
                    </Text>

                    {selected && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={
                          theme.primary
                        }
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

        {/* =================================
            INCOME / EXPENSE SUMMARY
        ================================= */}

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
          {/* INCOME */}

          <View style={styles.summaryItem}>
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor:
                    "#22C55E22",
                },
              ]}
            >
              <Ionicons
                name="arrow-down"
                size={28}
                color="#22C55E"
              />
            </View>

            <View>
              <Text
                style={[
                  styles.summaryLabel,
                  {
                    color:
                      theme.secondaryText,
                  },
                ]}
              >
                Income
              </Text>

              <Text
                style={[
                  styles.incomeAmount,
                ]}
              >
                {formatAmount(
                  incomeTotal
                )}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.summaryDivider,
              {
                backgroundColor:
                  theme.border,
              },
            ]}
          />

          {/* EXPENSE */}

          <View style={styles.summaryItem}>
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor:
                    "#F25F5C22",
                },
              ]}
            >
              <Ionicons
                name="arrow-up"
                size={28}
                color="#F25F5C"
              />
            </View>

            <View>
              <Text
                style={[
                  styles.summaryLabel,
                  {
                    color:
                      theme.secondaryText,
                  },
                ]}
              >
                Expense
              </Text>

              <Text
                style={[
                  styles.expenseAmount,
                ]}
              >
                {formatAmount(
                  expenseTotal
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* =================================
            TRANSACTIONS HEADER
        ================================= */}

        <View style={styles.transactionHeader}>
          <Text
            style={[
              styles.transactionTitle,
              {
                color: theme.text,
              },
            ]}
          >
            Transactions
          </Text>

          <View style={styles.headerActions}>
            <Pressable
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
                All Types
              </Text>

              <Ionicons
                name="chevron-down"
                size={17}
                color={
                  theme.secondaryText
                }
              />
            </Pressable>

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
                name="filter-outline"
                size={21}
                color={theme.text}
              />
            </Pressable>
          </View>
        </View>

        {/* =================================
            LOADING
        ================================= */}

        {loading ? (
          <View
            style={styles.loadingContainer}
          >
            <ActivityIndicator
              size="small"
              color={theme.primary}
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
        ) : accounts.length === 0 ? (
          /* =================================
              NO ACCOUNT
          ================================= */

          <View
            style={[
              styles.emptyContainer,
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
                styles.emptyIcon,
                {
                  backgroundColor:
                    theme.primarybg,
                },
              ]}
            >
              <Ionicons
                name="wallet-outline"
                size={34}
                color={theme.primary}
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
              No accounts yet
            </Text>

            <Text
              style={[
                styles.emptyText,
                {
                  color:
                    theme.secondaryText,
                },
              ]}
            >
              Add an account first, then
              transactions can be added to it.
            </Text>
          </View>
        ) : transactions.length === 0 ? (
          /* =================================
              NO TRANSACTIONS
          ================================= */

          <View style={styles.noTransactions}>
            <View
              style={[
                styles.noTransactionIcon,
                {
                  backgroundColor:
                    theme.card,
                  borderColor:
                    theme.border,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="receipt-text-outline"
                size={40}
                color={theme.secondaryText}
              />
            </View>

            <Text
              style={[
                styles.noTransactionTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              No transactions
            </Text>

            <Text
              style={[
                styles.noTransactionText,
                {
                  color:
                    theme.secondaryText,
                },
              ]}
            >
              No transactions found for{" "}
              {selectedAccount?.name ??
                "this account"}{" "}
              in {monthText}.
            </Text>
          </View>
        ) : (
          /* =================================
              TRANSACTION LIST
          ================================= */

          groupedTransactions.map(
            (group) => (
              <View
                key={group.date}
                style={
                  styles.transactionGroup
                }
              >
                <Text
                  style={[
                    styles.dateHeader,
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
                  {group.items.map(
                    (
                      transaction,
                      index
                    ) => {
                      const category =
                        getCategory(
                          transaction.category_id
                        );

                      const iconName =
                        getTransactionIcon(
                          transaction
                        );

                      const iconColor =
                        getTransactionColor(
                          transaction
                        );

                      return (
                        <Pressable
                          key={
                            transaction.transaction_id
                          }
                          style={[
                            styles.transactionRow,
                            index <
                              group.items
                                .length -
                                1 && {
                              borderBottomColor:
                                theme.border,
                              borderBottomWidth:
                                StyleSheet.hairlineWidth,
                            },
                          ]}
                        >
                          {/* ICON */}

                          <View
                            style={[
                              styles.transactionIcon,
                              {
                                backgroundColor:
                                  iconColor +
                                  "22",
                              },
                            ]}
                          >
                            <MaterialCommunityIcons
                              name={
                                iconName as keyof typeof MaterialCommunityIcons.glyphMap
                              }
                              size={24}
                              color={
                                iconColor
                              }
                            />
                          </View>

                          {/* DETAILS */}

                          <View
                            style={
                              styles.transactionInfo
                            }
                          >
                            <Text
                              numberOfLines={
                                1
                              }
                              style={[
                                styles.itemTitle,
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
                              style={[
                                styles.itemSubtitle,
                                {
                                  color:
                                    theme.secondaryText,
                                },
                              ]}
                            >
                              {selectedAccount?.name ??
                                "Personal"}
                            </Text>
                          </View>

                          {/* AMOUNT */}

                          <Text
                            style={[
                              styles.itemAmount,
                              {
                                color:
                                  iconColor,
                              },
                            ]}
                          >
                            {getTransactionAmount(
                              transaction
                            )}
                          </Text>

                          <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={
                              theme.secondaryText
                            }
                          />
                        </Pressable>
                      );
                    }
                  )}
                </View>
              </View>
            )
          )
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 30,
  },

  // =========================================
  // SELECTORS
  // =========================================

  selectorRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },

  selector: {
    flex: 1,
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },

  selectorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 9,
    marginRight: 5,
  },

  accountDropdown: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },

  accountOption: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    borderBottomWidth:
      StyleSheet.hairlineWidth,
  },

  accountOptionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  accountOptionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },

  // =========================================
  // SUMMARY
  // =========================================

  summaryCard: {
    minHeight: 116,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 18,
  },

  summaryItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  summaryIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  summaryLabel: {
    fontSize: 13,
    marginBottom: 4,
  },

  incomeAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#22C55E",
  },

  expenseAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F25F5C",
  },

  summaryDivider: {
    width: 1,
    height: 52,
    marginHorizontal: 8,
  },

  // =========================================
  // TRANSACTION HEADER
  // =========================================

  transactionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  transactionTitle: {
    fontSize: 21,
    fontWeight: "700",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  typeButton: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 7,
  },

  typeButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },

  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // =========================================
  // TRANSACTION GROUP
  // =========================================

  transactionGroup: {
    marginBottom: 18,
  },

  dateHeader: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    paddingHorizontal: 2,
  },

  transactionCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },

  transactionRow: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },

  transactionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  transactionInfo: {
    flex: 1,
    paddingRight: 8,
  },

  itemTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  itemSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },

  itemAmount: {
    fontSize: 15,
    fontWeight: "700",
    marginRight: 8,
  },

  // =========================================
  // LOADING
  // =========================================

  loadingContainer: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    fontSize: 13,
    marginTop: 10,
  },

  // =========================================
  // EMPTY ACCOUNT
  // =========================================

  emptyContainer: {
    minHeight: 240,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },

  // =========================================
  // NO TRANSACTIONS
  // =========================================

  noTransactions: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 55,
    paddingHorizontal: 30,
  },

  noTransactionIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  noTransactionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 7,
  },

  noTransactionText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});