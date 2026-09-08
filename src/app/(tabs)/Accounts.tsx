import { useTheme } from "@/context/ThemeContext";
import {
  Account,
  getAccounts,
} from "@/services/accountService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Accounts() {
  const { theme } = useTheme();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const { refresh } = useLocalSearchParams<{ refresh?: string }>();

  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getAccounts();

      setAccounts(data);

      console.log("Accounts loaded:", data);
    } catch (error) {
      console.error("Failed to load accounts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [refresh,loadAccounts]);

  const getCurrencySymbol = (currency: string) => {
    if (currency?.startsWith("USD")) {
      return "$";
    }

    if (currency?.startsWith("EUR")) {
      return "€";
    }

    if (currency?.startsWith("GBP")) {
      return "£";
    }

    if (currency?.startsWith("JPY")) {
      return "¥";
    }

    return "₹";
  };

  const formatBalance = (
    balance: number | null,
    currency: string
  ) => {
    const amount = Number(balance ?? 0);

    return `${getCurrencySymbol(currency)}${amount.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.primarybg,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Transfer Button */}
        <View style={styles.transferContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              console.log("Transfer pressed");
            }}
            style={[
              styles.transferButton,
              {
                backgroundColor: theme.primary,
              },
            ]}
          >
            <Ionicons
              name="swap-horizontal"
              size={21}
              color="#FFFFFF"
              style={styles.transferIcon}
            />

            <Text style={styles.transferText}>
              Transfer
            </Text>
          </TouchableOpacity>
        </View>

        {/* Accounts List */}
        <View
          style={[
            styles.accountList,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="small"
                color={theme.primary}
              />

              <Text
                style={[
                  styles.loadingText,
                  {
                    color: theme.secondaryText,
                  },
                ]}
              >
                Loading accounts...
              </Text>
            </View>
          ) : accounts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View
                style={[
                  styles.emptyIcon,
                  {
                    backgroundColor: theme.primarybg,
                  },
                ]}
              >
                <Ionicons
                  name="wallet-outline"
                  size={32}
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
                    color: theme.secondaryText,
                  },
                ]}
              >
                Tap the + button above to add your
                first account.
              </Text>
            </View>
          ) : (
            accounts.map((account) => {
              const accountColor =
                account.color || theme.primary;

              return (
                <TouchableOpacity
                  key={account.id}
                  activeOpacity={0.75}
                  style={[
                    styles.accountRow,
                    {
                      borderBottomColor: theme.border,
                    },
                  ]}
                >
                  {/* Account Icon */}
                  <View
                    style={[
                      styles.accountIcon,
                      {
                        backgroundColor:
                          accountColor + "22",
                      },
                    ]}
                  >
                    <Ionicons
                      name="person"
                      size={23}
                      color={accountColor}
                    />
                  </View>

                  {/* Account Name */}
                  <View style={styles.accountInfo}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.accountName,
                        {
                          color: theme.text,
                        },
                      ]}
                    >
                      {account.name}
                    </Text>

                    <Text
                      style={[
                        styles.currencyText,
                        {
                          color: theme.secondaryText,
                        },
                      ]}
                    >
                      {account.currency}
                    </Text>
                  </View>

                  {/* Balance */}
                  <View style={styles.balanceContainer}>
                    <Text
                      style={[
                        styles.balanceText,
                        {
                          color: theme.text,
                        },
                      ]}
                    >
                      {formatBalance(
                        account.opening_balance,
                        account.currency
                      )}
                    </Text>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={theme.secondaryText}
                    />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Information */}
        <View style={styles.infoContainer}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={theme.secondaryText}
          />

          <Text
            style={[
              styles.infoText,
              {
                color: theme.secondaryText,
              },
            ]}
          >
            You can add extra Accounts here. For example
            you may want to have different Accounts for
            different people, or have a separate
            "Savings" account.
          </Text>
        </View>

        {/* Space above bottom tab bar */}
        <View style={{ height: 90 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 12,
    paddingBottom: 20,
  },

  transferContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },

  transferButton: {
    minWidth: 150,
    height: 54,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    elevation: 2,
  },

  transferIcon: {
    marginRight: 8,
  },

  transferText: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
  },

  accountList: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },

  accountRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  accountInfo: {
    flex: 1,
    paddingRight: 8,
  },

  accountName: {
    fontSize: 18,
    fontWeight: "500",
  },

  currencyText: {
    fontSize: 11,
    marginTop: 3,
  },

  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  balanceText: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 5,
  },

  loadingContainer: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    fontSize: 13,
    marginTop: 10,
  },

  emptyContainer: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
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

  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 28,
    paddingTop: 35,
    gap: 8,
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
});